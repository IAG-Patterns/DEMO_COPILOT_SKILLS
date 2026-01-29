// msw/server.js


const { setupServer } = require('msw/node');
const { http } = require('msw');


export const handlers = [
  http.get('https://opensky-network.org/api/states/all*', ({ request }, res, ctx) => {
    const url = new URL(request.url);
    // Only fail for Europe region (lamin=35&lomin=-10&lamax=55&lomax=25)
    if (
      url.searchParams.get('lamin') === '35' &&
      url.searchParams.get('lomin') === '-10' &&
      url.searchParams.get('lamax') === '55' &&
      url.searchParams.get('lomax') === '25'
    ) {
      return res(ctx.status(500), ctx.json({}));
    }
    // Otherwise, pass through (simulate success with empty data)
    return res(ctx.status(200), ctx.json({ states: [] }));
  }),
];

export const server = setupServer(...handlers);
