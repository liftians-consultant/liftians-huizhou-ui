import {
  FETCH_TASK_STATUS_SUCCESS,
  FETCH_TASK_STATUS_FAILURE,
} from '../types';

const statusDefaultState = {
  taskStatusList: {},
};

export default function status(state = statusDefaultState, action = {}) {
  switch (action.type) {
    case FETCH_TASK_STATUS_SUCCESS:
      return { ...state, taskStatusList: action.taskStatusList };
    case FETCH_TASK_STATUS_FAILURE:
      return { ...state, taskStatusList: {} };
    default:
      return state;
  }
}
