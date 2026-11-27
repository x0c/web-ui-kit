#!/usr/bin/env python3
"""Build, verify, and publish immutable x0c/web-ui-kit release assets."""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPOSITORY = "x0c/web-ui-kit"


def run(cmd: list[str], *, capture: bool = False) -> str:
    result = subprocess.run(cmd, cwd=ROOT, check=True, text=True, capture_output=capture)
    return result.stdout.strip() if capture else ""


def validate_version(tag: str) -> str:
    if not re.fullmatch(r"v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\w.-]+)?", tag):
        raise SystemExit(f"Invalid release tag: {tag}")
    version = tag.removeprefix("v")
    versions = {
        name: json.loads((ROOT / f"packages/{name}/package.json").read_text())["version"]
        for name in ("ui", "tokens")
    }
    if any(found != version for found in versions.values()):
        raise SystemExit(f"Version mismatch: tag={tag}, ui={versions['ui']}, tokens={versions['tokens']}")
    return version


def remote_tag_commit(tag: str) -> str | None:
    ref = f"refs/tags/{tag}"
    peeled = f"{ref}^{{}}"
    lines = run(["git", "ls-remote", "--tags", "origin", ref, peeled], capture=True)
    refs = {name: sha for sha, name in (line.split() for line in lines.splitlines())}
    return refs.get(peeled) or refs.get(ref)


def assert_tag_matches(tag: str, expected: str, actual: str | None, *, required: bool) -> None:
    if actual != expected and (actual is not None or required):
        raise SystemExit(f"{tag} must point at {expected}; found {actual or 'no tag'}")


def release_already_exists(tag: str, expected: set[str]) -> bool:
    result = subprocess.run(
        ["gh", "release", "view", tag, "-R", REPOSITORY, "--json", "isDraft,assets,url"],
        cwd=ROOT, capture_output=True, text=True,
    )
    if result.returncode:
        if result.stderr.strip() == "release not found":
            return False
        raise SystemExit(result.stderr.strip() or f"Could not check release {tag}")
    release = json.loads(result.stdout)
    assets = {asset["name"] for asset in release["assets"] if asset["state"] == "uploaded" and asset["size"] > 0}
    if release["isDraft"] or not expected.issubset(assets):
        raise SystemExit(f"Release {tag} is incomplete. Existing assets are protected; use a new version.")
    print(f"Release already complete; assets unchanged: {release['url']}")
    return True


def default_release_notes(tag: str) -> str:
    ver = tag.removeprefix("v")
    return f"""## English

`@x0c/tokens` and `@x0c/ui` {tag} ship Flat Monochrome CSS tokens, optional Geist fonts, Radix UI primitives, and reusable console patterns as immutable GitHub Release tarballs. No authentication is required to install them.

```bash
npm install react react-dom lucide-react https://github.com/x0c/web-ui-kit/releases/download/{tag}/x0c-ui-{ver}.tgz
```

## 简体中文

`@x0c/tokens` 与 `@x0c/ui` {tag} 以不可变的 GitHub Release 压缩包发布，提供单色设计令牌、可选的 Geist 字体、Radix UI 基础组件和可复用的控制台组件。安装无需登录。

```bash
npm install react react-dom lucide-react https://github.com/x0c/web-ui-kit/releases/download/{tag}/x0c-ui-{ver}.tgz
```
"""


def build_assets(version: str, *, ci: bool) -> list[pathlib.Path]:
    run([sys.executable, "-m", "unittest", "discover", "-s", "scripts", "-p", "test_*.py"])
    run(["pnpm", "install", "--frozen-lockfile"])
    install = ["pnpm", "exec", "playwright", "install", "chromium", "--only-shell"]
    run(install + (["--with-deps"] if ci else []))
    for task in ("build", "typecheck", "lint", "build:playground", "verify:contrast"):
        run(["pnpm", "run", task])

    dist = ROOT / "dist-release"
    shutil.rmtree(dist, ignore_errors=True)
    dist.mkdir()
    for name in ("tokens", "ui"):
        run(["pnpm", "--filter", f"@x0c/{name}", "pack", "--pack-destination", str(dist)])
    tokens, ui = [dist / f"x0c-{name}-{version}.tgz" for name in ("tokens", "ui")]
    run(["node", "scripts/verify-packages.mjs", str(tokens), str(ui)])
    sums = dist / "SHA256SUMS"
    sums.write_text("".join(f"{hashlib.sha256(asset.read_bytes()).hexdigest()}  {asset.name}\n" for asset in (tokens, ui)))
    return [tokens, ui, sums]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", required=True, help="Release tag (e.g. v0.4.2)")
    parser.add_argument("--notes-file", type=pathlib.Path, help="Optional bilingual Markdown release notes")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--ci", action="store_true", help="Publish the existing tag checked out by GitHub Actions")
    mode.add_argument("--build-only", action="store_true", help="Test and pack without creating tags or releases")
    args = parser.parse_args()

    tag = args.version if args.version.startswith("v") else f"v{args.version}"
    version = validate_version(tag)
    if args.build_only:
        build_assets(version, ci=False)
        return

    status = run(["git", "status", "--porcelain"], capture=True)
    if status:
        raise SystemExit(f"Working tree is not clean:\n{status}")
    head = run(["git", "rev-parse", "HEAD"], capture=True)
    remote = remote_tag_commit(tag)
    assert_tag_matches(tag, head, remote, required=args.ci)
    local = run(["git", "tag", "--list", tag], capture=True)
    if local:
        assert_tag_matches(tag, head, run(["git", "rev-parse", f"{tag}^{{commit}}"], capture=True), required=True)
    expected = {f"x0c-tokens-{version}.tgz", f"x0c-ui-{version}.tgz", "SHA256SUMS"}
    if release_already_exists(tag, expected):
        assert_tag_matches(tag, head, remote, required=True)
        return

    assets = build_assets(version, ci=args.ci)
    if not args.ci and remote is None:
        if not local:
            run(["git", "tag", tag, head])
        run(["git", "push", "origin", "main"])
        run(["git", "push", "origin", tag])
    assert_tag_matches(tag, head, remote_tag_commit(tag), required=True)
    # Both local and Actions publishers may observe a new tag. Neither can replace assets.
    if not release_already_exists(tag, expected):
        notes = args.notes_file.read_text(encoding="utf-8") if args.notes_file else default_release_notes(tag)
        notes_file = assets[0].parent / "RELEASE_NOTES.md"
        notes_file.write_text(notes, encoding="utf-8")
        run(["gh", "release", "create", tag, *map(str, assets), "--verify-tag", "-R", REPOSITORY,
             "--title", f"web-ui-kit {tag}", "--notes-file", str(notes_file)])
        if not release_already_exists(tag, expected):
            raise SystemExit(f"Could not verify all assets on release {tag}")


if __name__ == "__main__":
    main()
