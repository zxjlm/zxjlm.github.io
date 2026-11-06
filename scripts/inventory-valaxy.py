"""Extract the route contract from an unmodified Valaxy SSG build."""
import argparse
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import quote, urlsplit
from xml.etree import ElementTree


class CatalogLinks(HTMLParser):
    def __init__(self, prefix):
        super().__init__()
        self.prefix = prefix
        self.paths = set()

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        href = dict(attrs).get("href") or ""
        if href.startswith(self.prefix) and href != self.prefix:
            self.paths.add(href)


def inventory(dist, commit):
    files = {path.relative_to(dist).as_posix() for path in dist.rglob("*") if path.is_file()}
    pages = {}
    downloads = []
    support = []
    internal = []
    for file in sorted(files):
        if file == "index.html":
            route, kind = "/", "home"
        elif file == "404.html":
            route, kind = "/404.html", "not-found"
        elif file.endswith("/index.html"):
            route, kind = "/" + file[:-len("index.html")], "section"
        elif file.endswith(".html"):
            stem = file[:-len(".html")]
            section = f"{stem}/index.html"
            route = "/" + stem + ("/" if section in files else "")
            kind = "section"
            if section not in files:
                kind = {"posts": "post", "albums": "album"}.get(stem.split("/", 1)[0], kind)
        elif file.startswith("posts/") and file.endswith(".md"):
            downloads.append("/" + file)
            continue
        elif file.startswith("assets/") or file == "valaxy-fuse-list.json":
            internal.append(file)
            continue
        elif file not in {"_headers", "_redirects"}:
            support.append("/" + file)
            continue
        else:
            continue
        pages.setdefault(route, {"path": route, "kind": kind, "files": []})["files"].append(file)

    linked = []
    for section in ("categories", "tags"):
        parser = CatalogLinks(f"/{section}/")
        parser.feed((dist / f"{section}.html").read_text(encoding="utf8"))
        for href in sorted(parser.paths):
            path = urlsplit(href.replace("\\", "/")).path
            request = quote(path, safe="/%:@!$&'()*+,;=-._~")
            linked.append({
                "kind": "category" if section == "categories" else "tag",
                "href": href,
                "browserPath": request,
                "hasSsgFile": any(
                    file in files
                    for file in (path.lstrip("/").rstrip("/") + ".html", path.strip("/") + "/index.html")
                ),
            })

    atom = ElementTree.parse(dist / "atom.xml")
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    atom_ids = [entry.findtext("atom:id", namespaces=ns) for entry in atom.findall("atom:entry", ns)]
    rss = ElementTree.parse(dist / "feed.xml")
    rss_ids = [entry.findtext("guid") for entry in rss.findall("./channel/item")]
    feed_json = json.loads((dist / "feed.json").read_text(encoding="utf8"))
    json_ids = [item["id"] for item in feed_json["items"]]
    post_urls = {"https://blog.harumonia.moe" + path for path, page in pages.items() if page["kind"] == "post"}
    if any(len(ids) != len(post_urls) or set(ids) != post_urls for ids in (atom_ids, rss_ids, json_ids)):
        raise ValueError("Feed entry IDs differ from published post URLs")
    if {path[:-len(".md")] for path in downloads} != {p for p, page in pages.items() if page["kind"] == "post"}:
        raise ValueError("Markdown exports differ from published post URLs")

    return {
        "sourceCommit": commit,
        "scope": "Unmodified Valaxy SSG. Files and linked routes are evidence of build output; live HTTP behavior requires separate verification.",
        "counts": {
            "htmlFiles": sum(len(page["files"]) for page in pages.values()),
            "pagePaths": len(pages),
            "pageKinds": dict(sorted(Counter(page["kind"] for page in pages.values()).items())),
            "markdownExports": len(downloads),
            "linkedCollectionDetails": dict(sorted(Counter(link["kind"] for link in linked).items())),
            "feedItemsPerFormat": len(atom_ids),
            "buildDependencies": len(internal),
        },
        "pages": [pages[path] for path in sorted(pages)],
        "markdownExports": downloads,
        "publicFiles": support,
        "collectionDetailLinks": linked,
        "buildOnly": {"assetPrefix": "/assets/", "searchData": "/valaxy-fuse-list.json"},
        "deploymentFiles": ["/" + name for name in ("_headers", "_redirects") if name in files],
        "robotsSitemaps": [
            line.partition(":")[2].strip()
            for line in (dist / "robots.txt").read_text(encoding="utf8").splitlines()
            if line.lower().startswith("sitemap:")
        ],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dist", type=Path)
    parser.add_argument("commit")
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    result = inventory(args.dist, args.commit)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    print(json.dumps(result["counts"], ensure_ascii=False))
