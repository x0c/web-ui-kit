#!/usr/bin/env python3
"""Local release builder and GitHub Release uploader for x0c/web-ui-kit."""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys


ROOT = pathlib.Path(__file__).resolve().parent.parent


def run(cmd: list[str], cwd: pathlib.Path = ROOT, capture: bool = False) -> str:
    res = subprocess.run(
        cmd,
        cwd=cwd,
        check=True,
        text=True,
        capture_output=capture,
    )
    return res.stdout.strip() if capture else ""


def ensure_clean_tree() -> None:
    status = run(["git", "status", "--porcelain"], capture=True)
    if status:
        raise SystemExit(f"Working tree is not clean:\n{status}")


def sha256_file(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            chunk = f.read(1024 * 1024)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def default_release_notes(version: str) -> str:
    ver = version.lstrip("v")
    return f"""## English

`@x0c/tokens` and `@x0c/ui` {version} ship Flat Monochrome CSS tokens, opt-in Geist font imports (`@x0c/ui/fonts.css`), Radix UI primitives, `DataTable` (`@tanstack/react-table`), `CommandPalette` (`cmdk`), `FormDialog`, `Sheet`, and `AdminShell` as self-contained immutable GitHub Release tarballs (zero auth required).

### Install

```bash
npm install react react-dom lucide-react https://github.com/x0c/web-ui-kit/releases/download/{version}/x0c-ui-{ver}.tgz
```

---

## 简体中文

`@x0c/tokens` 与 `@x0c/ui` {version} 以不可变 GitHub Release 压缩包形式发布（免登录拉取，配合 `package-lock.json` 做 SHA-512 锁定），提供 Flat Monochrome 设计 Token、按需引入的 Geist 字体（`@x0c/ui/fonts.css`）、Radix UI 原语、`DataTable`（`@tanstack/react-table`）、`CommandPalette`（`cmdk`）、`FormDialog`、`Sheet` 与 `AdminShell`。

### 安装命令

```bash
npm install react react-dom lucide-react https://github.com/x0c/web-ui-kit/releases/download/{version}/x0c-ui-{ver}.tgz
```
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Build, verify, and publish x0c/web-ui-kit tarballs to GitHub Releases.")
    parser.add_argument("--version", required=True, help="Release tag (e.g. v0.3.0)")
    parser.add_argument("--notes-file", help="Optional Markdown file for bilingual release notes")
    args = parser.parse_args()

    tag = args.version if args.version.startswith("v") else f"v{args.version}"
    ver = tag.lstrip("v")

    ensure_clean_tree()

    pkg_ui = json.loads((ROOT / "packages/ui/package.json").read_text(encoding="utf-8"))
    pkg_tokens = json.loads((ROOT / "packages/tokens/package.json").read_text(encoding="utf-8"))
    if pkg_ui["version"] != ver or pkg_tokens["version"] != ver:
        raise SystemExit(
            f"Version mismatch: tag={tag}, @x0c/ui={pkg_ui['version']}, @x0c/tokens={pkg_tokens['version']}"
        )

    run(["pnpm", "install", "--frozen-lockfile"])
    run(["pnpm", "run", "build"])
    run(["pnpm", "run", "typecheck"])
    run(["pnpm", "run", "lint"])
    run(["pnpm", "run", "build:playground"])

    dist_rel = ROOT / "dist-release"
    shutil.rmtree(dist_rel, ignore_errors=True)
    dist_rel.mkdir(parents=True, exist_ok=True)

    run(["pnpm", "--filter", "@x0c/tokens", "pack", "--pack-destination", str(dist_rel)])
    run(["pnpm", "--filter", "@x0c/ui", "pack", "--pack-destination", str(dist_rel)])

    tokens_tgz = dist_rel / f"x0c-tokens-{ver}.tgz"
    ui_tgz = dist_rel / f"x0c-ui-{ver}.tgz"
    if not tokens_tgz.exists() or not ui_tgz.exists():
        raise SystemExit("Expected packed tarballs were not produced.")

    checksum_lines = [
        f"{sha256_file(tokens_tgz)}  {tokens_tgz.name}",
        f"{sha256_file(ui_tgz)}  {ui_tgz.name}",
    ]
    sums_file = dist_rel / "SHA256SUMS"
    sums_file.write_text("\n".join(checksum_lines) + "\n", encoding="utf-8")

    # Create tag if missing and push tag
    existing_tags = run(["git", "tag", "--list", tag], capture=True)
    if existing_tags != tag:
        run(["git", "tag", tag])
    run(["git", "push", "origin", "main"])
    run(["git", "push", "origin", tag])

    notes = (
        pathlib.Path(args.notes_file).read_text(encoding="utf-8")
        if args.notes_file
        else default_release_notes(tag)
    )
    notes_tmp = dist_rel / "RELEASE_NOTES.md"
    notes_tmp.write_text(notes, encoding="utf-8")

    release_exists = subprocess.run(
        ["gh", "release", "view", tag],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    ).returncode == 0

    if not release_exists:
        run(
            [
                "gh",
                "release",
                "create",
                tag,
                str(tokens_tgz),
                str(ui_tgz),
                str(sums_file),
                "--title",
                f"web-ui-kit {tag}",
                "--notes-file",
                str(notes_tmp),
            ]
        )
    else:
        run(["gh", "release", "edit", tag, "--title", f"web-ui-kit {tag}", "--notes-file", str(notes_tmp)])
        run(
            [
                "gh",
                "release",
                "upload",
                tag,
                str(tokens_tgz),
                str(ui_tgz),
                str(sums_file),
                "--clobber",
            ]
        )

    latest = run(["gh", "api", "/repos/x0c/web-ui-kit/releases/latest", "--jq", ".tag_name"], capture=True)
    assets = run(["gh", "release", "view", tag, "--json", "assets", "--jq", "[.assets[].name] | join(\", \")"], capture=True)
    print(f"Published {tag} (latest={latest}) with assets: {assets}")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as err:
        sys.exit(err.returncode)
