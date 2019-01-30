import { STATION_ID_SET,
  STATION_ACTIVATE_SUCCESS,
  STATION_ACTIVATE_ERROR,
  STATION_DEACTIVATE_SUCCESS,
  STATION_DEACTIVATE_ERROR,
  STATION_CURRENT_UNFINISH_TASK_FETCHED,
  SET_STATION_TASK_TYPE,
} from 'redux/types';

import { toast } from 'react-toastify';
import api from 'api';

export const stationActivateSuccess = () => ({
  type: STATION_ACTIVATE_SUCCESS,
});

export const stationActivateError = () => ({
  type: STATION_ACTIVATE_ERROR,
});

export const stationDeactivateSuccess = () => ({
  type: STATION_DEACTIVATE_SUCCESS,
});

export const stationDeactivateError = () => ({
  type: STATION_DEACTIVATE_ERROR,
});

export const setStationId = stationId => (dispatch, getState) => {
  const { station } = getState();
  station.id = stationId;
  dispatch({ type: STATION_ID_SET, station });
};

export const activateStation = (stationId, userId) => (dispatch, getState) => new Promise((resolve) => {
  const { stationActivated } = getState().station;

  if (!stationActivated) {
    api.station.activateStation(stationId, userId).then((res) => {
      if (res.success && res.data) {
        toast.success('Station Activated');
        dispatch(stationActivateSuccess());
        resolve(true);
      } else {
        toast.error('Cannot activate station');
        dispatch(stationActivateError());
        resolve(false);
      }
    }).catch(() => {
      dispatch(stationActivateError());
      resolve(false);
    });
  } else {
    resolve(true);
  }
});

export const deactivateStation = () => dispatch => api.station.deactivateStation().then((res) => {
  if (res.success) {
    toast.success('Station Deactivated');
    dispatch(stationDeactivateSuccess());
    return true;
  }
  toast.error('Cannot deactivate station');
  dispatch(stationDeactivateError());
  return false;
}).catch(() => {
  dispatch(stationDeactivateError());
  return false;
});


export const checkCurrentUnFinishTask = stationId => dispatch =>
  // eslint-disable-next-line implicit-arrow-linebreak
  api.station.checkCurrentUnFinishTask(stationId).then((res) => {
    const stationInfo = {
      taskType: 'U',
      taskCount: 0,
    };
    if (res.success) {
      const tasks = res.data;
      tasks.forEach((element) => {
        if (element.cnt > 0) {
          stationInfo.taskType = element.taskType;
          stationInfo.taskCount = element.cnt;
        }
      });
    }
    dispatch({ type: STATION_CURRENT_UNFINISH_TASK_FETCHED, stationInfo });
    return stationInfo;
  });

export const setStationTaskType = taskType => (dispatch, getState) => {
  const { station } = getState();
  const stationInfo = station.info;
  stationInfo.taskType = taskType;
  dispatch({ type: SET_STATION_TASK_TYPE, stationInfo });
};
