import { STATION_ID_SET,
  STATION_ACTIVATE_SUCCESS,
  STATION_ACTIVATE_ERROR,
  STATION_CURRENT_UNFINISH_TASK_FETCHED,
  SET_STATION_TASK_TYPE,
} from 'redux/types';
import api from 'api';

export const stationActivateSuccess = () => ({
  type: STATION_ACTIVATE_SUCCESS,
});

export const stationActivateError = () => ({
  type: STATION_ACTIVATE_ERROR,
});

export const setStationId = stationId => (dispatch, getState) => {
  const { station } = getState();
  station.id = stationId;
  dispatch({ type: STATION_ID_SET, station });
};

export const activateStation = stationId => (dispatch) => {
  api.station.activateStation(stationId).then((res) => {
    if (res.success) {
      dispatch(stationActivateSuccess());
    } else {
      dispatch(stationActivateError());
    }
  }).catch(() => {
    dispatch(stationActivateError());
  });
};


export const checkCurrentUnFinishTask = stationId => dispatch =>
  // eslint-disable-next-line implicit-arrow-linebreak
  api.station.checkCurrentUnFinishTask(stationId).then((res) => {
    const tasks = res.data;
    const stationInfo = {
      taskType: 'U',
      taskCount: 0,
    };
    tasks.forEach((element) => {
      if (element.cnt > 0) {
        stationInfo.taskType = element.taskType;
        stationInfo.taskCount = element.cnt;
      }
    });
    dispatch({ type: STATION_CURRENT_UNFINISH_TASK_FETCHED, stationInfo });
    return stationInfo;
  });

export const setStationTaskType = taskType => (dispatch, getState) => {
  const { station } = getState();
  const stationInfo = station.info;
  stationInfo.taskType = taskType;
  dispatch({ type: SET_STATION_TASK_TYPE, stationInfo });
};
