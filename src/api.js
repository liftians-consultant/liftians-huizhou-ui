import axios from 'axios';
import appConfig from 'services/AppConfig';
import * as apiKey from 'apiKey.json';
import { parseJSON, parseResult } from 'utils/utils';

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

function wmsRequest(messageType, data) {
  return axios.post(`${appConfig.getApiUrl()}/wms/api`, {
    messageType,
    data,
    msgId: uuidv4(),
    token: localStorage.liftiansJWT,
  });
}

const user = {
  // login: credentials => axios.post(`${appConfig.getApiUrl()}/login`, { ...credentials }, { timeout: 6000, headers: { 'content-type': 'application/json' } })
  //   .then(res => res.headers.authorization),

  login: credentials => loginRequest(credentials)
    .then(res => parseResult(res)),

  logout: () => axios.post(`${appConfig.getApiUrl()}/logout`).then(res => res),

  getInfoById: empId => axios.post(`${appConfig.getApiUrl()}/Setup`, {
    name: 'EmpolyeesFindByID',
    parameter: [empId],
  }).then(res => res.data),
};

const status = {
  getTaskStatus: () => wmsRequest('STAT_TYPE', 'TaskStat')
    .then(res => parseResult(res)),
};

const station = {
  activateStation: stationId => wmsRequest('ACTIVATE_STATION', {
    stationId,
  }).then(res => parseResult(res)),

  deactivateStation: () => wmsRequest('DEACTIVATE_STATION')
    .then(res => parseResult(res)),

  checkCurrentUnFinishTask: stationId => wmsRequest('CURRENT_UNFINISH_TASK', stationId)
    .then(res => parseJSON(res)),

  getStationPodLayout: () => wmsRequest('GET_CURRENT_POD_LAYOUT')
    .then(res => parseResult(res)),

  // getStationPodLayout: () => Promise.resolve({
  //   success: true,
  //   data: [{
  //   locationName: 'one',
  //   barCode: '100123',
  //   volume: 20,
  //   podId: 10,
  //   podSide: 0,
  //   shelfId: 3,
  //   boxId: 9
  // }, {
  //   locationName: 'one',
  //   barCode: '100123',
  //   volume: 20,
  //   podId: 10,
  //   podSide: 0,
  //   shelfId: 4,
  //   boxId: 2
  // }, {
  //   locationName: 'one',
  //   barCode: '100123',
  //   volume: 20,
  //   podId: 10,
  //   podSide: 0,
  //   shelfId: 5,
  //   boxId: 2
  // }, {
  //   locationName: 'one',
  //   barCode: '100123',
  //   volume: 20,
  //   podId: 10,
  //   podSide: 0,
  //   shelfId: 3,
  //   boxId: 2
  // }, {
  //   locationName: 'one',
  //   barCode: '100123',
  //   volume: 20,
  //   podId: 10,
  //   podSide: 0,
  //   shelfId: 1,
  //   boxId: 1
  // }, {
  //   locationName: 'one',
  //   barCode: '100123',
  //   volume: 20,
  //   podId: 10,
  //   podSide: 0,
  //   shelfId: 2,
  //   boxId: 1
  // }, {
  //   locationName: 'one',
  //   barCode: '100123',
  //   volume: 20,
  //   podId: 10,
  //   podSide: 0,
  //   shelfId: 2,
  //   boxId: 2
  // }, {
  //   locationName: 'one',
  //   barCode: '100123',
  //   volume: 20,
  //   podId: 10,
  //   podSide: 0,
  //   shelfId: 2,
  //   boxId: 5
  // }]}),

  getStationProductInfo: () => wmsRequest('GET_CURRENT_PRODUCT_INFO')
    .then(res => parseResult(res, ['13'])),

  // getStationProductInfo: () => Promise.resolve({
  //   success: true,
  //   data: {
  //     podId: 10,
  //     podSide: 1,
  //     shelfId: 3,
  //     boxId: 1,
  //     binBarCode: '12121',
  //     binColor: '111',
  //     deliveryTask: {
  //       stat: 0,
  //       quantity: 1.00456,
  //       productId: 4,
  //       productName: 'Kombucha is the best',
  //       productBarCode: 'D8V203AC2B',
  //       batch: '005',
  //       updateTime: 1546528763387,
  //       warehouse: 'H180',
  //       barCode: '8656657',
  //       manufacturer: 2,
  //       unit: 'GM',
  //       areaId: 0,
  //       createTime: 1546528763387,
  //       plant: 'HT001',
  //       id: 0,
  //       locationCode: '1000023061',
  //       userId: 0,
  //     },
  //   },
  // }),

  atStationTask: stationId => axios.get(`${appConfig.getApiUrl()}/atStation/CurrentTask?stationID=${stationId}`),

  startStationOperation: operationType => wmsRequest('START_STATION_OPERATION', operationType)
    .then(res => parseResult(res)),

  stopStationOperation: () => wmsRequest('STOP_STATION_OPERATION')
    .then(res => parseResult(res)),

  forcePodToLeaveStationByTaskId: (stationId, taskId) => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'ForcePod2LeaveStationByTaskID',
    parameter: [
      String(stationId),
      String(taskId),
    ],
  }),

  genStationTask: stationId => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'GenStationTask',
    parameter: [
      String(stationId),
    ],
  }),

  getStationDeviceList: stationId => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'GetDeviceListByStationId',
    parameter: [
      String(stationId),
    ],
  }),

  checkNumberOfStationTasks: stationId => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'CheckNumberOfStationTasks',
    parameter: [
      String(stationId),
    ],
  }),
};

const pick = {
  resetTestData: stationId => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'ResetTestData',
    parameter: [stationId],
  }),

  retrieveOrderFromAsm: barCode => wmsRequest('GET_ORDER_LABEL', barCode)
    .then(res => parseResult(res)),

  // retrieveOrderFromAsm: barCode => Promise.resolve({
  //   success: true,
  //   data: {
  //     stat: 0,
  //     quantity: 1.00456,
  //     productId: 4,
  //     productBarCode: 'D8V203AC2B',
  //     batch: '005',
  //     updateTime: 1546528763387,
  //     warehouse: 'H180',
  //     barCode: '86566337' + (Math.floor(Math.random() * 10) + 1),
  //     manufacturer: 2,
  //     unit: 'GM',
  //     areaId: 0,
  //     createTime: 1546528763387,
  //     plant: 'HT001',
  //     id: 0,
  //     locationCode: '1000023061',
  //   },
  // }),

  getStationOrderList: (stationId, pageNum, pageSize) => wmsRequest('GET_STATION_ORDER_LIST', {
    stationId,
    pageNum,
    pageSize,
  }).then(res => parseResult(res)),

  startPickTask: orderList => wmsRequest('START_DELIVERY_TASK', orderList)
    .then(res => parseResult(res)),

  pushDeliveryProcess: (type, barCode) => wmsRequest('PUSH_DELIVERY_PROCESS', {
    type,
    barCode,
  }).then(res => parseResult(res, ['20', '21', '22'])),

  bindBinToOrder: (orderBarCode, binBarCode) => wmsRequest('DELIVERY_BIND_BIN', {
    orderBarCode,
    binBarCode,
  }).then(res => parseResult(res)),

  // bindBinToOrder: (orderBarCode, binBarCode) => Promise.resolve({
  //   success: true,
  // }),

  callServerGeneratePickTask: stationId => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'GenPickTask',
    parameter: [stationId],
  }),

  stopPickOperation: (stationId, empId) => station.stopStationOperation(stationId, empId, 'P'),

  getPickInfoByTaskId: taskId => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'GetPickInfoByTaskID',
    parameter: [String(taskId)],
  }),

  atStationAfterPickProduct: data => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'AtStationAfterPickProduct',
    parameter: [
      String(data.stationId),
      String(data.shelfId),
      String(data.boxId),
      String(data.orderNo),
      String(data.sourceLinesId),
      String(data.productId),
      String(data.lotNo),
      String(data.packageBarcode),
      String(data.pickQuantity),
      String(data.taskSubtype),
      String(data.shortQty),
    ],
  }),

  getProductSerialNum: data => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'GetProductByInvLocation',
    parameter: [
      String(data.podId),
      String(data.podSide),
      String(data.shelfId),
      String(data.boxId),
    ],
  }),

  atHolderAfterPickProduct: data => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'AtHolderAfterPickProduct',
    parameter: [
      String(data.holderId),
      String(data.orderNo),
      String(data.sourceLinesId),
      String(data.productId),
      String(data.lotNo),
      String(data.taskSubtype),
      String(data.pickQuantity),
    ],
  }),

  checkIsOrderFinished: orderNum => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'IsOrderFinished',
    parameter: [orderNum],
  }),

  getInventoryByProductBarcode: (barcode, podId, podSide) => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'GetInventoryByProductBarcode',
    parameter: [
      String(barcode),
      String(podId || 0),
      String(podSide || 0),
    ],
  }),

  linkBinToHolder: (binId, deviceId) => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'LinkBinToHolder',
    parameter: [
      String(binId),
      String(deviceId),
    ],
  }),

  getBinInfoAfterHolderTag: (binBarcode, holderId) => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'GetBinInfoAfterHolderTag',
    parameter: [
      String(binBarcode),
      String(holderId),
    ],
  }),

  getUnassignedHolderByStation: stationId => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'GetUnassignedHolderByStation',
    parameter: [
      String(stationId),
    ],
  }),

  unassignBinFromHolder: holderId => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'UnassignBinFromHolder',
    parameter: [
      String(holderId),
    ],
  }),

  changeHolderBin: (binBarcode, holderId) => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'ChangeHolderBin',
    parameter: [
      String(binBarcode),
      String(holderId),
    ],
  }),

  unlinkAllBinFromHolder: stationId => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'UnlinkAllBinFromHolder',
    parameter: [
      String(stationId),
    ],
  }),

  getProductByLocationCode: location => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'GetProductByLocationCode',
    parameter: [
      String(location),
    ],
  }),
};

const replenish = {
  retrieveReplenishRecords: (stationId, billTypeId, processId) => axios.post(`${appConfig.getApiUrl()}/Replenish`, {
    name: 'DisplayReplenish',
    parameter: [
      String(stationId),
      String(billTypeId),
      String(processId),
    ],
  }),

  getReplenishDetailBySourceId: sourceId => axios.post(`${appConfig.getApiUrl()}/Replenish`, {
    name: 'GetReplenishDetailBySourceID',
    parameter: [String(sourceId)],
  }),

  DisplayReplenishDetail: requestId => axios.post(`${appConfig.getApiUrl()}/Replenish`, {
    name: 'DisplayReplenishDetail',
    parameter: [String(requestId)],
  }),

  replenishBySourceId: (stationId, userId, sourceIdList, jobPriority) => axios.post(`${appConfig.getApiUrl()}/Replenish`, {
    name: 'ReplenishBySourceID',
    parameter: [
      String(stationId),
      String(userId),
      String(sourceIdList),
      String(jobPriority),
    ],
  }),

  replenishByBillNo: (stationId, userId, sourceIdList, jobPriority) => axios.post(`${appConfig.getApiUrl()}/Replenish`, {
    name: 'ReplenishByBillNo',
    parameter: [
      String(stationId),
      String(userId),
      String(sourceIdList),
      String(jobPriority),
    ],
  }),

  getReplenishInfoByTaskId: taskId => axios.post(`${appConfig.getApiUrl()}/Replenish`, {
    name: 'GetReplenishInfoByTaskID',
    parameter: [String(taskId)],
  }),

  atStationSubmitReplenishProduct: data => axios.post(`${appConfig.getApiUrl()}/Replenish`, {
    name: 'AtStationSubmitReplenishProduct',
    parameter: [
      String(data.taskId),
      String(data.boxBarcode),
      String(data.sourceLinesId),
      String(data.productId),
      String(data.productBarcodeList),
      String(data.replenishQty),
      String(data.locateActType),
    ],
  }),

  getProductInfoByReplenishBillProduct: (billNo, productId) => axios.post(`${appConfig.getApiUrl()}/Replenish`, {
    name: 'GetProductInfoByReplenishBillProduct',
    parameter: [
      String(billNo),
      String(productId),
    ],
  }),

  getProductInfoByTaskId: (taskId, sourceLinesId, productId, processStatusId) => axios.post(`${appConfig.getApiUrl()}/Replenish`, {
    name: 'GetProductInfoByTaskID',
    parameter: [
      String(taskId),
      String(sourceLinesId),
      String(productId),
      String(processStatusId),
    ],
  }),
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
