import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPostIds, normalizePostDate, readPostMetadata } from '../src/lib/post-metadata.mjs';

test('blog dates preserve the Shanghai calendar and explicit offsets', () => {
  assert.equal(normalizePostDate('2024/2/9 4:08:04').toISOString(), '2024-02-08T20:08:04.000Z');
  assert.equal(normalizePostDate('2024-02-09').toISOString(), '2024-02-08T16:00:00.000Z');
  assert.equal(normalizePostDate('2024-02-09T04:08:04.123-0500').toISOString(), '2024-02-09T09:08:04.123Z');
  for (const value of ['2023-02-29', '2024-13-01', '2024-02-09 24:00', '2024-02-09 15:00+24:00', 'today', null]) {
    assert.throws(() => normalizePostDate(value), Error);
  }
});

test('legacy date parsing retains feed timestamps and optional metadata', () => {
  const data = readPostMetadata('---\r\ntitle: "A: test"\r\ndate: 2024/2/9 4:08:04 # comment\r\nupdated: ""\r\nslug: 17\r\ndraft: true\r\n---\r\nText', 'test.md');
  assert.equal(data.feedDate.toISOString(), '2024-02-09T04:08:04.000Z');
  assert.equal(data.updated, undefined);
  assert.equal(data.slug, 17);
  assert.equal(data.draft, true);
  assert.throws(() => readPostMetadata('---\ndate: [\n---\n', 'bad.md'), /bad\.md: invalid YAML/);
  assert.throws(() => readPostMetadata('---\ndate: invalid\n---\n', 'bad.md'), /bad\.md: date:/);
  assert.throws(() => readPostMetadata('---\ndate: 2024-02-09\nupdated: never\n---\n', 'bad.md'), /bad\.md: updated:/);
});

test('same-path and case-only post IDs fail without collapsing case in other routes', () => {
  assert.doesNotThrow(() => checkPostIds(['Notes.md', 'travel/notes.md']));
  assert.throws(() => checkPostIds(['Notes.md', 'notes.MD']), /Duplicate post ID: Notes\.md and notes\.MD/);
});
