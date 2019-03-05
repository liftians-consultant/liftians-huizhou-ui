import {
  FETCH_TASK_STATUS_SUCCESS,
  FETCH_TASK_STATUS_FAILURE,
  FETCH_CANCEL_REASON_SUCCESS,
  FETCH_CANCEL_REASON_FAILURE,
  FETCH_STATION_TASK_STATUS_SUCCESS,
  FETCH_STATION_TASK_STATUS_FAILURE,
} from '../types';

const statusDefaultState = {
  taskStatusList: {},
  cancelReasonList: {},
  stationTaskStaus: {},
};

export default function status(state = statusDefaultState, action = {}) {
  switch (action.type) {
    case FETCH_TASK_STATUS_SUCCESS:
      return { ...state, taskStatusList: action.taskStatusList };
    case FETCH_TASK_STATUS_FAILURE:
      return { ...state, taskStatusList: {} };
    case FETCH_CANCEL_REASON_SUCCESS:
      return { ...state, cancelReasonList: action.cancelReasonList };
    case FETCH_CANCEL_REASON_FAILURE:
      return { ...state, cancelReasonList: {} };
    case FETCH_STATION_TASK_STATUS_SUCCESS:
      return { ...state, stationTaskStatus: action.stationTaskStatus };
    case FETCH_STATION_TASK_STATUS_FAILURE:
      return { ...state, stationTaskStatus: {} };
    default:
      return state;
  }
}
