import { test } from 'node:test';
import { strictEqual } from 'node:assert';
import { basename } from '../../../src/shared/utils/path.ts';

test('basename should return the last part of a path', () => {
    // POSIX paths
    strictEqual(basename('a/b/c'), 'c');
    strictEqual(basename('/usr/local/bin/node'), 'node');
    strictEqual(basename('/'), '');

    // Windows paths
    strictEqual(basename('a\\b\\c'), 'c');
    strictEqual(basename('C:\\path\\to\\file.txt'), 'file.txt');

    // Edge cases
    strictEqual(basename('abc'), 'abc');
    strictEqual(basename('/a/b/c/'), '');
    strictEqual(basename(''), '');
});
