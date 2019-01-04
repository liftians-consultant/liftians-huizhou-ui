const proxy = require('http-proxy-middleware');

const serverUrl = 'http://localhost';

module.exports = function mapProxy(app) {
  app.use(proxy('/v1', { target: `${serverUrl}:8070` }));
  app.use(proxy('/wms/api', { target: `${serverUrl}:8080` }));
  app.use(proxy('/logout', { target: `${serverUrl}:8060` }));
  app.use(proxy('/Common', { target: `${serverUrl}:8060` }));
  app.use(proxy('/Setup', { target: `${serverUrl}:8060` }));
  app.use(proxy('/Pick', { target: `${serverUrl}:8060` }));
  app.use(proxy('/Replenish', { target: `${serverUrl}:8060` }));
  app.use(proxy('/Inventory', { target: `${serverUrl}:8060` }));
  app.use(proxy('/eTag', { target: `${serverUrl}:8060` }));
  app.use(proxy('/Info', { target: `${serverUrl}:8060` }));
  app.use(proxy('/atStation', { target: `${serverUrl}:8060` }));
  app.use(proxy('/logs', { target: `${serverUrl}:8060` }));
};
