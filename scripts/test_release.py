import json
from pathlib import Path
from subprocess import CompletedProcess
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

import release


class ReleaseTests(unittest.TestCase):
    def test_each_package_must_match_the_release_version(self):
        with TemporaryDirectory() as temp, patch.object(release, 'ROOT', Path(temp)):
            for name, version in (('ui', '0.4.2'), ('tokens', '0.4.1')):
                path = Path(temp) / 'packages' / name / 'package.json'
                path.parent.mkdir(parents=True)
                path.write_text(json.dumps({'version': version}))
            with self.assertRaisesRegex(SystemExit, 'Version mismatch'):
                release.validate_version('v0.4.2')
            path.write_text(json.dumps({'version': '0.4.2'}))
            self.assertEqual(release.validate_version('v0.4.2'), '0.4.2')

    def test_cannot_retarget_or_publish_an_unchecked_tag(self):
        with self.assertRaisesRegex(SystemExit, 'must point at'):
            release.assert_tag_matches('v0.4.2', 'expected', 'different', required=False)
        with self.assertRaisesRegex(SystemExit, 'no tag'):
            release.assert_tag_matches('v0.4.2', 'expected', None, required=True)
        release.assert_tag_matches('v0.4.2', 'expected', None, required=False)

    def test_only_definite_not_found_allows_creation(self):
        for stderr, absent in [('release not found\n', True), ('HTTP 403\n', False)]:
            with self.subTest(stderr=stderr), patch.object(release.subprocess, 'run', return_value=CompletedProcess([], 1, '', stderr)):
                if absent:
                    self.assertFalse(release.release_already_exists('v0.4.2', {'tarball'}))
                else:
                    with self.assertRaisesRegex(SystemExit, '403'):
                        release.release_already_exists('v0.4.2', {'tarball'})

    def test_complete_release_is_read_only_and_incomplete_release_is_preserved(self):
        for draft, state, size, complete in [(False, 'uploaded', 123, True), (True, 'uploaded', 123, False),
                                               (False, 'uploaded', 0, False), (False, 'starter', 123, False)]:
            with self.subTest(draft=draft, state=state, size=size):
                data = {'isDraft': draft, 'url': 'https://example.test/release',
                        'assets': [{'name': 'tarball', 'state': state, 'size': size}]}
                response = CompletedProcess([], 0, json.dumps(data), '')
                with patch.object(release.subprocess, 'run', return_value=response) as call:
                    if complete:
                        self.assertTrue(release.release_already_exists('v0.4.2', {'tarball'}))
                    else:
                        with self.assertRaisesRegex(SystemExit, 'protected'):
                            release.release_already_exists('v0.4.2', {'tarball'})
                    self.assertEqual(call.call_count, 1)
                    self.assertEqual(call.call_args.args[0][0:3:2], ['gh', 'view'])


if __name__ == '__main__':
    unittest.main()
