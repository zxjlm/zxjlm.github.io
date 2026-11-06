function inlineText(node) {
  return node.value ?? node.alt ?? node.children?.map(inlineText).join('') ?? '';
}

// Port of Zaxon's markdown-it coordinate paragraphs. Content stays unchanged.
export function remarkTravelStops() {
  return (tree, file) => {
    const isTravel = file.data.astro?.frontmatter?.layout === 'travel';
    const stops = [];
    const walk = node => {
      if (node.type === 'code' && node.lang) {
        const lang = node.lang.toLowerCase();
        node.lang = ({ mysql: 'sql', plain_text: 'text', math: 'text', plain: 'text', pyhton: 'python', python3: 'python', conf: 'ini' })[lang] || lang;
      }
      if (isTravel && node.type === 'paragraph') {
        const last = node.children?.at(-1);
        if (last?.type === 'text') {
          const match = last.value.match(/(?:^|\n)(-?\d{1,2}(?:\.\d+)?)\s*[,，]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
          if (match && Math.abs(+match[1]) <= 90 && Math.abs(+match[2]) <= 180) {
            const before = last.value.slice(0, match.index).trimEnd();
            const place = [...node.children.slice(0, -1), ...(before ? [{ type: 'text', value: before }] : [])];
            while (place.at(-1)?.type === 'break') place.pop();
            const index = stops.length;
            stops.push({ lat: Number(match[1]), lng: Number(match[2]), place: place.map(inlineText).join('').trim() });
            node.data = { hProperties: {
              className: ['travel-stop'], id: `travel-stop-${index}`,
              'data-travel-stop': String(index), 'data-lat': match[1], 'data-lng': match[2],
            } };
            node.children = [
              { type: 'travelPlace', data: { hName: 'span', hProperties: { className: ['travel-stop__place'] } }, children: place },
              { type: 'travelCoords', data: { hName: 'span', hProperties: { className: ['travel-stop__coords'] } }, children: [{ type: 'text', value: `${match[1]}, ${match[2]}` }] },
            ];
          }
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
    if (isTravel) file.data.astro.frontmatter.travelStops = stops;
  };
}
