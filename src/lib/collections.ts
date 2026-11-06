import type { Post } from './posts';

export type CollectionKind = 'categories' | 'tags';

export interface CollectionDetail {
  name: string;
  path: string;
  legacyPath: string;
  posts: Post[];
}

export interface CategoryNode {
  detail: CollectionDetail;
  posts: Post[];
  children: Map<string, CategoryNode>;
}

const uncategorized = 'Uncategorized';

export function postCategories(post: Post) {
  return post.data.categories.length ? post.data.categories : [uncategorized];
}

const caseFold = (value: string) => value.normalize('NFC').toLowerCase();

function legacyPath(name: string) {
  // Browsers historically interpret a backslash in an HTTP path as a separator.
  return name.normalize('NFC').replaceAll('\\', '/');
}

function collectionDetails(members: Map<string, Post[]>) {
  const reserved = new Set([...members.keys()].map(name => caseFold(legacyPath(name))));
  const paths = new Set<string>();
  const assigned = new Map<string, string>();
  // Assign aliases in name order so edits to dates or membership do not rename pages.
  for (const name of [...members.keys()].sort()) {
    const legacy = legacyPath(name);
    let path = legacy;
    if (paths.has(caseFold(path))) {
      let suffix = 2;
      do {
        path = `${legacy}-${suffix++}`;
      } while (reserved.has(caseFold(path)) || paths.has(caseFold(path)));
    }
    paths.add(caseFold(path));
    assigned.set(name, path);
  }
  return new Map([...members].map(([name, posts]) => [
    name, { name, posts, path: assigned.get(name)!, legacyPath: legacyPath(name) },
  ]));
}

function addMember(map: Map<string, Post[]>, name: string, post: Post) {
  const members = map.get(name);
  if (members) members.push(post);
  else map.set(name, [post]);
}

export function collectionUrl(kind: CollectionKind, path: string) {
  // Keep the plus characters in c++ as written in the old navigation.
  const encoded = path.split('/').map(segment => encodeURIComponent(segment).replaceAll('%2B', '+')).join('/');
  return `/${kind}/${encoded}/`;
}

export function buildCollections(posts: Post[]) {
  const categoryMembers = new Map<string, Post[]>();
  const tagMembers = new Map<string, Post[]>();
  for (const post of posts) {
    for (const category of new Set(postCategories(post))) addMember(categoryMembers, category, post);
    for (const tag of new Set(post.data.tags)) addMember(tagMembers, tag, post);
  }

  const categories = collectionDetails(categoryMembers);
  const tags = collectionDetails(tagMembers);
  const tree = new Map<string, CategoryNode>();
  for (const post of posts) {
    let children = tree;
    for (const category of postCategories(post)) {
      let node = children.get(category);
      if (!node) {
        node = { detail: categories.get(category)!, children: new Map(), posts: [] };
        children.set(category, node);
      }
      node.posts.push(post);
      children = node.children;
    }
  }
  const uncategorizedNode = tree.get(uncategorized);
  if (uncategorizedNode) {
    tree.delete(uncategorized);
    return { categories, tags, tree: new Map([[uncategorized, uncategorizedNode], ...tree]) };
  }
  return { categories, tags, tree };
}

export function collectionAliases(posts: Post[]) {
  const { categories, tags } = buildCollections(posts);
  return ([
    ['categories', categories],
    ['tags', tags],
  ] as const).flatMap(([kind, entries]) => [...entries.values()]
    .filter(({ path, legacyPath }) => path !== legacyPath
      && ![...entries.values()].some(entry => entry.path === legacyPath))
    .map(({ path, legacyPath }) => ({
      from: collectionUrl(kind, legacyPath),
      to: collectionUrl(kind, path),
    })));
}
