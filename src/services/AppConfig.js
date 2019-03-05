const appConfig = {
  apiHost: 'http://localhost',
  apiPort: '8060',
  apiUrl: 'http://localhost:8080',
  erpUrl: 'http://localhost:8070',
  erpPort: process.env.REACT_APP_ENV === 'DEV' ? '3000' : '8070',
  webSocketUrl: 'ws://localhost:8080',
  stationId: '1',
  token: 'fe122884-eefd-4613-9473-757125f61a1',

  getApiHost() {
    return this.apiHost;
  },

  setApiHost(host) {
    this.apiHost = host;
  },

  getApiPort() {
    return this.apiPort;
  },

  getApiUrl() {
    return this.apiUrl;
  },

  getErpUrl() {
    return this.erpUrl;
  },

  setApiUrl(host, port) {
    this.apiHost = host;
    this.apiPort = port;
    this.apiUrl = this.generateApiUrl(host, port);
    this.erpUrl = this.generateApiUrl(host, this.erpPort);
    localStorage.apiHost = host;
    localStorage.apiPort = port;
    this.webSocketUrl = this.generateApiUrl(host.replace('http', 'ws'), port);
    console.log(`[SET URL] API Url: ${this.apiUrl}`);
    console.log(`[SET URL] ERP Url: ${this.erpUrl}`);
  },

  getStationId() {
    return this.stationId;
  },

  setStationId(id) {
    this.stationId = id;
    localStorage.stationId = id;
  },

  generateApiUrl(host, port) {
    let url = '';
    if (port) {
      url = `${host}:${port}`;
    }
    return url;
  },

  getToken() {
    return this.token;
  },

  setToken(newToken) {
    this.token = newToken;
  },

  getWsUrl() {
    return this.webSocketUrl;
  },
};

export default appConfig;
