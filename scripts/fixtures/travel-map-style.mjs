// A minimal vector tile with one "place" point, in Mapbox vector tile format.
const tile = Buffer.from('Gi54AgoFcGxhY2UogCASDwgBEgIAABgBIgUJgCCAIBoEbmFtZSIJCgdGaXh0dXJl', 'base64');

export async function useTravelMapFixture(context) {
  await context.route('https://local-map.test/tiles/**', route => route.fulfill({
    body: tile,
    contentType: 'application/vnd.mapbox-vector-tile',
    headers: { 'Access-Control-Allow-Origin': '*' },
  }));
  await context.route('https://tiles.openfreemap.org/styles/*', route => {
    const style = new URL(route.request().url()).pathname.split('/').at(-1);
    return route.fulfill({
      json: {
        version: 8,
        sources: {
          places: { type: 'vector', tiles: ['https://local-map.test/tiles/{z}/{x}/{y}.pbf'] },
        },
        layers: [
          {
            id: 'background', type: 'background',
            paint: { 'background-color': style === 'fiord' ? '#26323c' : '#d7dac9' },
          },
          {
            // Reproduce the optional OpenFreeMap sprite warning without an external service.
            id: 'place-label', type: 'symbol', source: 'places', 'source-layer': 'place',
            layout: { 'icon-image': 'circle-11' },
          },
        ],
      },
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  });
}
