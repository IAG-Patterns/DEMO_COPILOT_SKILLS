// msw/globalSetup.js
module.exports = async () => {
  const { server } = require('./server');
  server.listen();
};
