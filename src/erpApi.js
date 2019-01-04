import axios from 'axios';
import appConfig from 'services/AppConfig';
import moment from 'moment';
// import * as apiKey from 'apiKey.json';
/**
 * All ERP API call.
 */
const erpAxios = axios.create();

const basicAuthConfig = () => ({
  auth: {
    username: 'apiKey.key',
    password: 'apiKey.secret',
  },
});

const info = {
  getReceiveType: () => erpAxios.get(`${appConfig.getErpUrl()}/v1/info/receiveType`, basicAuthConfig()),
};

const account = {
  getAccount: accountNo => erpAxios.get(`${appConfig.getErpUrl()}/v1/accounts/${accountNo}`, basicAuthConfig())
    .then(res => ({ success: true, account: res.data }))
    .catch(() => ({ success: false })),

  createAccount: data => erpAxios.post(`${appConfig.getErpUrl()}/v1/accounts`, [{
    ...data,
    createDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
    modifyDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
  }], basicAuthConfig()),

  getAccountList: () => erpAxios.get(`${appConfig.getErpUrl()}/v1/accounts`, basicAuthConfig()),
};

const product = {
  getProduct: productSku => erpAxios.get(`${appConfig.getErpUrl()}/v1/products/${productSku}`, basicAuthConfig())
    .then(res => ({ success: true, product: res.data }))
    .catch(() => ({ success: false })),

  createProduct: data => erpAxios.post(`${appConfig.getErpUrl()}/v1/products`, [{
    ...data,
    createDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
    modifyDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
  }], basicAuthConfig()),

  getProductList: () => erpAxios.get(`${appConfig.getErpUrl()}/v1/products`, basicAuthConfig()),

  getProductListByAccount: accountNo => erpAxios.get(`${appConfig.getErpUrl()}/v1/products?accountNo=${accountNo}`, basicAuthConfig()),
};

const replenish = {
  getReplenish: requestNo => erpAxios.get(`${appConfig.getErpUrl()}/v1/replenishments/${requestNo}`, basicAuthConfig())
    .then(res => ({ success: true, product: res.data }))
    .catch(() => ({ success: false })),

  createReplenish: data => erpAxios.post(`${appConfig.getErpUrl()}/v1/replenishments`, [{
    ...data,
    createDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
    modifyDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
  }], basicAuthConfig()),

  getReplenishList: () => erpAxios.get(`${appConfig.getErpUrl()}/v1/replenishments`, basicAuthConfig()),
};

const order = {
  createOrder: data => erpAxios.post(`${appConfig.getErpUrl()}/v1/orders`, [{
    ...data,
    createDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
    modifyDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
  }], basicAuthConfig()),
};

export default {
  info,
  account,
  product,
  replenish,
  order,
};
