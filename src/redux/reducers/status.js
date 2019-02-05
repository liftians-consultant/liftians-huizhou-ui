import {
  FETCH_TASK_STATUS_SUCCESS,
  FETCH_TASK_STATUS_FAILURE,
  FETCH_CANCEL_REASON_SUCCESS,
  FETCH_CANCEL_REASON_FAILURE,
} from '../types';

const statusDefaultState = {
  taskStatusList: {},
  cancelReasonList: {},
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
    default:
      return state;
  }
}
