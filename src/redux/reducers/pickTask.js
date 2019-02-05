import {
  RESET_TASK_PAGE,
  OPEN_REMOVE_DIALOG,
} from '../types';

const pickTaskDefaultState = {
  openRemoveDialog: false,
};

export default function status(state = pickTaskDefaultState, action = {}) {
  switch (action.type) {
    case RESET_TASK_PAGE:
      return { ...pickTaskDefaultState };
    case OPEN_REMOVE_DIALOG:
      return { ...state, ...action.data };
    default:
      return state;
  }
}
