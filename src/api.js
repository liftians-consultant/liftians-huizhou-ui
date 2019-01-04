import axios from 'axios';
import appConfig from 'services/AppConfig';
import * as apiKey from 'apiKey.json';
import { parseJSON } from 'utils/utils';

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
    .then(res => parseJSON(res)),

  logout: () => axios.post(`${appConfig.getApiUrl()}/logout`).then(res => res),

  getInfoById: empId => axios.post(`${appConfig.getApiUrl()}/Setup`, {
    name: 'EmpolyeesFindByID',
    parameter: [empId],
  }).then(res => res.data),
};

const menu = {
  getBillTypeName: operationType => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'BillType',
    parameter: [operationType],
  }),

  getProcessStatusName: operationType => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'ProcessStatus',
    parameter: [operationType],
  }),
};

const station = {
  activateStationWithUser: (stationId, empId) => axios.post(`${appConfig.getApiUrl()}/Setup`, {
    name: 'ActivateStationOperation',
    parameter: [String(stationId), empId, '4'],
  }).then(res => res.data),

  deactivateStationWithUser: (stationId, empId) => axios.post(`${appConfig.getApiUrl()}/Setup`, {
    name: 'DeactivateStationOperation',
    parameter: [String(stationId), empId],
  }).then(res => res.data),

  checkCurrentUnFinishTask: stationId => wmsRequest('CURRENT_UNFINISH_TASK', stationId)
    .then(res => parseJSON(res)),

  atStationPodLayoutInfo: stationId => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'AtStationPodLayoutInfo',
    parameter: [
      String(stationId),
    ],
  }),

  getPodLayoutInfoByTaskID: taskId => axios.post(`${appConfig.getApiUrl()}/Common`, {
    name: 'GetPodLayoutInfoByTaskID',
    parameter: [
      String(taskId),
    ],
  }),

  atStationTask: stationId => axios.get(`${appConfig.getApiUrl()}/atStation/CurrentTask?stationID=${stationId}`),

  startStationOperation: (stationId, empId, operationType) => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'StartStationOperation',
    parameter: [stationId, empId, operationType],
  }),

  stopStationOperation: (stationId, empId, taskType) => axios.post(`${appConfig.getApiUrl()}/Setup`, {
    name: 'StopStationOperation',
    parameter: [stationId, empId, taskType],
  }),

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

  retrievePickOrderReocrdsByTypeAndState: (stationId, billTypeId, processId) => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'DisplayPickMenu',
    parameter: [
      stationId,
      String(billTypeId),
      String(processId),
    ],
  }),

  retrievePickOrderItems: orderId => axios.post(`${appConfig.getApiUrl()}/Pick`, {
    name: 'DisplayPickOrderDetail',
    parameter: [orderId],
  }),

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
  menu,
  station,
  pick,
  replenish,
  inventory,
  system,
  eTag,
  erpProcess,
  account,
};
