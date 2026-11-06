"""Compare migration contracts against the preserved Valaxy SSG distribution."""
import json
import pathlib
import sys
import xml.etree.ElementTree as xml
from html.parser import HTMLParser


class Headings(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        if tag in {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}:
            anchor = dict(attrs).get('id')
            if anchor is not None:
                self.ids.append(anchor)


def by_key(items, key):
    return {item[key]: item for item in items}


old, new = map(pathlib.Path, sys.argv[1:3])
old_feed = json.loads((old / 'feed.json').read_text())
new_feed = json.loads((new / 'feed.json').read_text())
expected = by_key(old_feed['items'], 'id')
actual = by_key(new_feed['items'], 'id')
assert expected == actual, [
    (key, field) for key, item in expected.items()
    for field, value in item.items() if actual.get(key, {}).get(field) != value
]

for name, entry, id_tag in [
    ('atom.xml', '{http://www.w3.org/2005/Atom}entry', '{http://www.w3.org/2005/Atom}id'),
    ('feed.xml', './channel/item', 'guid'),
]:
    def entries(directory):
        return {node.findtext(id_tag): xml.tostring(node) for node in xml.parse(directory / name).findall(entry)}
    assert entries(old) == entries(new), name

count = 0
for file in (old / 'posts').rglob('*.html'):
    replacement = new / file.relative_to(old)
    before = Headings(file.read_text()).ids
    after = Headings(replacement.read_text()).ids
    assert before == after, (replacement, set(before) ^ set(after))
    count += 1
print(json.dumps({'matchingArticleAnchors': count, 'matchingFeedItemsPerFormat': len(expected)}, indent=2))
