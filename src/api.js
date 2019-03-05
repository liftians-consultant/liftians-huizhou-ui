import axios from 'axios';
import appConfig from 'services/AppConfig';
import * as apiKey from 'apiKey.json';
import { parseResult } from 'utils/utils';

const uuidv4 = require('uuid/v4');

/**
 * All API call.
 */

function loginRequest(credentials) {
  return axios.post(`${appConfig.getApiUrl()}/wms/api`, {
    messageType: 'LOGIN',
    data: {
      username: credentials.username,
      password: credentials.password,
    },
    msgId: uuidv4(),
    token: apiKey.loginToken,
  }, { timeout: 6000 });
}

function wmsRequest(messageType, data, param = {}) {
  return axios.post(`${appConfig.getApiUrl()}/wms/api`, {
    messageType,
    data,
    msgId: uuidv4(),
    token: localStorage.liftiansJWT,
  }, param);
}

const user = {
  // login: credentials => axios.post(`${appConfig.getApiUrl()}/login`, { ...credentials }, { timeout: 6000, headers: { 'content-type': 'application/json' } })
  //   .then(res => res.headers.authorization),

  login: credentials => loginRequest(credentials)
    .then(res => parseResult(res)),

  logout: () => wmsRequest('LOGIN_OUT')
    .then(res => parseResult(res)),
};

const status = {
  getTaskStatus: () => wmsRequest('STAT_TYPE', 'TaskStat')
    .then(res => parseResult(res)),

  getCancelReason: () => wmsRequest('STAT_TYPE', 'TaskStat')
    .then(res => parseResult(res)),

  getStationTaskStatus: () => wmsRequest('LANGUAGE', {
    type: 'StationTaskStat',
    langId: null,
  }).then(res => parseResult(res)),
};

const station = {
  activateStation: stationId => wmsRequest('ACTIVATE_STATION', {
    stationId,
  }).then(res => parseResult(res)),

  deactivateStation: () => wmsRequest('DEACTIVATE_STATION')
    .then(res => parseResult(res)),

  checkCurrentUnFinishTask: stationId => wmsRequest('CURRENT_UNFINISH_TASK', stationId)
    .then(res => parseResult(res)),

  getStationPodLayout: () => wmsRequest('GET_CURRENT_POD_LAYOUT')
    .then(res => parseResult(res)),

  getStationProductInfo: () => wmsRequest('GET_CURRENT_PRODUCT_INFO')
    .then(res => parseResult(res, ['13', '14'])),

  startStationOperation: operationType => wmsRequest('START_STATION_OPERATION', operationType)
    .then(res => parseResult(res)),

  stopStationOperation: () => wmsRequest('STOP_STATION_OPERATION')
    .then(res => parseResult(res)),
};

const pick = {
  resetTestData: stationId => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'ResetTestData',
    parameter: [stationId],
  }),

  retrieveOrderFromAsm: barCode => wmsRequest('GET_ORDER_LABEL', encodeURI(barCode))
    .then(res => parseResult(res)),

  getStationOrderList: (stationId, taskStat, pageNum, pageSize) => wmsRequest('GET_ORDER_LIST', {
    stationId,
    taskStat,
    pageNum,
    pageSize,
  }).then(res => parseResult(res)),

  startPickTask: orderList => wmsRequest('START_DELIVERY_TASK', orderList, { timeout: 60000 })
    .then(res => parseResult(res)),

  pushDeliveryProcess: (type, barCode) => wmsRequest('PUSH_DELIVERY_PROCESS', {
    type,
    barCode: encodeURI(barCode),
  }).then(res => parseResult(res, ['20', '21', '22'])),

  bindBinToOrder: (orderBarCode, binBarCode) => wmsRequest('DELIVERY_BIND_BIN', {
    orderBarCode: encodeURI(orderBarCode),
    binBarCode: encodeURI(binBarCode),
  }).then(res => parseResult(res)),

  cancelDeliveryOrder: orderId => wmsRequest('CANCEL_DELIVERY_ORDER', orderId)
    .then(res => parseResult(res)),
};

const replenish = {
  retreiveReceiveFromAsm: barCode => wmsRequest('GET_RECEIVE_LABEL', encodeURI(barCode))
    .then(res => parseResult(res)),

  getStationReplenishList: (stationId, taskStat, pageNum, pageSize) => wmsRequest('GET_REPLENISH_LIST', {
    stationId,
    taskStat,
    pageNum,
    pageSize,
  }).then(res => parseResult(res)),

  startReceiveTask: receiveList => wmsRequest('START_RECEIVE_TASK', receiveList)
    .then(res => parseResult(res)),

  getReceiveProductInfo: () => wmsRequest('GET_RECEIVE_PRODUCT_INFO')
    .then(res => parseResult(res, ['13', '14', '35'])),

  pushReceiveProcess: (type, barCode) => wmsRequest('PUSH_RECEIVE_PROCESS', {
    type,
    barCode,
  }).then(res => parseResult(res, ['15', '16', '99'], ['21', '22', '23', '26', '28', '29'])),
};

const inventory = {
  getProductCategory: () => axios.post(`${appConfig.getApiUrl()}/Inventory`, {
    name: 'GetProductCategory',
    parameter: [],
  }),

  getProductType: () => axios.post(`${appConfig.getApiUrl()}/Inventory`, {
    name: 'GetProductType',
    parameter: [],
  }),

  getExpirationMonthRange: () => axios.post(`${appConfig.getApiUrl()}/Inventory`, {
    name: 'GetExpirationMonthRange',
    parameter: [],
  }),

  getInventorySummaryByProduct: data => axios.post(`${appConfig.getApiUrl()}/Inventory`, {
    name: 'GetInventorySumByProduct',
    parameter: [
      String(data.type),
      String(data.category),
      String(data.productId),
      String(data.productName),
      String(data.expireDate),
    ],
  }),

  getProductInfoByScanCode: scancode => axios.get(`${appConfig.getApiUrl()}/Info/GetProductInfoByScanCode/?scanCode=${scancode}`),
};

const system = {
  // /Info/getTaskInfo?taskID=${taskID}&podID=${podID}&botID=${botID}
  getTaskList: () => axios.get(`${appConfig.getApiUrl()}/Info/GetTaskInfo`),

  getExpirationRule: () => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'GetExpirationRule',
    parameter: [],
  }),

  setExpirationRule: (empId, taskType, numDays) => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'SetExpirationRule',
    parameter: [
      String(empId),
      String(taskType),
      String(numDays),
    ],
  }),
};

const eTag = {
  turnPickLightOnById: (labelId, pickNum) => axios.post(`${appConfig.getApiUrl()}/eTag/pick/on`, {
    labelId,
    pickNum,
  }),

  turnPickLightOffById: labelId => axios.post(`${appConfig.getApiUrl()}/eTag/pick/off`, {
    labelId,
  }),

  turnEndLightOnById: labelId => axios.post(`${appConfig.getApiUrl()}/eTag/end/on`, {
    labelId,
  }),

  turnEndLightOffById: labelId => axios.post(`${appConfig.getApiUrl()}/eTag/end/off`, {
    labelId,
  }),

  checkRespond: labelId => axios.post(`${appConfig.getApiUrl()}/eTag/checkRespond`, {
    labelId,
  }),
};

const erpProcess = {
  product: () => axios.get(`${appConfig.getApiUrl()}/Info/processERP?flag=1`),

  inventory: () => axios.get(`${appConfig.getApiUrl()}/Info/processERP?flag=2`),

  order: () => axios.get(`${appConfig.getApiUrl()}/Info/processERP?flag=3`),

  replenishment: () => axios.get(`${appConfig.getApiUrl()}/Info/processERP?flag=4`),
};

const account = {
  insert: data => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'InsertAccount',
    parameter: [
      String(data.accountName),
      String(data.description),
      String(data.active),
    ],
  }),
};

export default {
  user,
  status,
  station,
  pick,
  replenish,
  inventory,
  system,
  eTag,
  erpProcess,
  account,
};
