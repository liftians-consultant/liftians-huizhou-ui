import {
  DEVICE_LIST_FETCHED,
  SET_HOLDER_SETUP_WAITLIST,
  ADD_BIN_TO_HOLDER,
  UNASSIGN_BIN_FROM_HOLDER,
  SHOW_CHANGE_BIN_MODAL,
  UNLINK_ALL_BIN_FROM_HOLDER_SUCCESS,
} from 'redux/types';
import api from 'api';
import ETagService from 'services/ETagService';
import * as log4js from 'log4js2';

const opActionLog = log4js.getLogger('OperationAction');

function addBinInfoToHolder(holderId, binInfo) {
  return {
    type: ADD_BIN_TO_HOLDER,
    holderId,
    binInfo,
  };
}

function setHolderSetupWaitlist(holderSetupWaitlist, currentSetupHolder) {
  return {
    type: SET_HOLDER_SETUP_WAITLIST,
    holderSetupWaitlist,
    currentSetupHolder,
  };
}

function removeBinFromHolder(holderId) {
  return {
    type: UNASSIGN_BIN_FROM_HOLDER,
    holderId,
  };
}

function showChangeBinModalAction() {
  return {
    type: SHOW_CHANGE_BIN_MODAL,
    showChangeBinModal: true,
  };
}

function hideChangeBinModalAction() {
  return {
    type: SHOW_CHANGE_BIN_MODAL,
    showChangeBinModal: false,
  };
}

function unlinkAllBinFromHolderSuccessAction() {
  return {
    type: UNLINK_ALL_BIN_FROM_HOLDER_SUCCESS,
  };
}

function unlinkAllBinFromHolderFailureAction() {
  return {
    type: UNLINK_ALL_BIN_FROM_HOLDER_SUCCESS,
  };
}

export const getStationDeviceList = stationId => dispatch => api.station.getStationDeviceList(stationId).then((res) => {
  const deviceList = res.data.map(device => ({
    deviceId: device.deviceID,
    deviceIndex: device.holderSequence,
    bin: {},
  }));
  dispatch({ type: DEVICE_LIST_FETCHED, deviceList });
  return deviceList;
});

export const addHoldersToSetupWaitlist = holderSetupWaitlist => (dispatch, getState) => {
  const holderId = holderSetupWaitlist.shift();
  const deviceList = getState().operation.deviceList;
  let currentSetupHolder = getState().operation.currentSetupHolder;
  if (deviceList.length > 0) {
    currentSetupHolder = deviceList.find(device => device.deviceId === holderId);
  }
  dispatch(setHolderSetupWaitlist(holderSetupWaitlist, currentSetupHolder));
};

export const addBinToHolder = (binBarcode, holderId) => (dispatch, getState) => api.pick.linkBinToHolder(binBarcode, holderId).then((res) => {
  if (res.data) {
    switch (res.data) {
      case -1:
        return false; // bin linked to holder
      case -2:
        return false; // bin linked to order
      default:
        opActionLog.info(`Linked ${binBarcode} to ${holderId} success`);
        ETagService.turnEndLightOffById(getState().operation.currentSetupHolder.deviceIndex);
        return api.pick.getBinInfoAfterHolderTag(binBarcode, holderId);
    }
  } else {
    return false;
  }
}).then((res) => {
  if (!res) return false;
  if (res.data) {
    opActionLog.info(`Retrieve ${binBarcode}'s info. Added to holder.`);
    dispatch(addBinInfoToHolder(holderId, res.data));
    return true;
  }
  return false;
}).then((res) => {
  const holderSetupWaitlist = getState().operation.holderSetupWaitlist;

  if (!res) return Promise.resolve(false);

  if (holderSetupWaitlist.length > 0) {
    const nextHolderId = holderSetupWaitlist.shift();
    const currentSetupHolder = getState().operation.deviceList.find(device => device.deviceId === nextHolderId);
    dispatch(setHolderSetupWaitlist(holderSetupWaitlist, currentSetupHolder));
  } else {
    dispatch(setHolderSetupWaitlist([], { deviceIndex: 0 }));
  }

  return Promise.resolve(true);
});

export const unassignBinFromHolder = holderId => dispatch =>
  // eslint-disable-next-line implicit-arrow-linebreak
  api.pick.unassignBinFromHolder(holderId).then(() => {
    opActionLog.info(`Unassigned bin from ${holderId}`);
    dispatch(removeBinFromHolder(holderId));
    return Promise.resolve(true);
  });

export const showChangeBinModal = () => dispatch => dispatch(showChangeBinModalAction());

export const hideChangeBinModal = () => dispatch => dispatch(hideChangeBinModalAction());

export const changeHolderBin = (binBarcode, holderId) => dispatch => api.pick.changeHolderBin(binBarcode, holderId).then((res) => {
  if (res.data === 1) {
    return api.pick.getBinInfoAfterHolderTag(binBarcode, holderId);
  }
  return res.data;
}).then((res) => {
  if (res && res.data) {
    dispatch(addBinInfoToHolder(holderId, res.data));
    return 1;
  }
  return res;
});

export const unlinkAllBinFromHolder = stationId => dispatch =>
  // eslint-disable-next-line implicit-arrow-linebreak
  api.pick.unlinkAllBinFromHolder(stationId).then((res) => {
    if (res.data) {
      dispatch(unlinkAllBinFromHolderSuccessAction());
      return true;
    }
    dispatch(unlinkAllBinFromHolderFailureAction());
    return false;
  });
