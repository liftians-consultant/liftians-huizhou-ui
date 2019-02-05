import {
  RESET_TASK_PAGE,
  OPEN_REMOVE_DIALOG,
  CLOSE_REMOVE_DIALOG,
} from 'redux/types';
import api from 'api';
import * as log4js from 'log4js2';

function resetTaskPageAction() {
  return {
    type: RESET_TASK_PAGE,
    data: {
      openRemoveDialog: true,
    },
  };
}

function setRemoveDialogAction(openRemoveDialog) {
  return {
    type: OPEN_REMOVE_DIALOG,
    data: {
      openRemoveDialog,
    },
  };
}

export const resetTaskPage = () => dispatch => dispatch(resetTaskPageAction());

export const setRemoveDialog = result => dispatch => dispatch(setRemoveDialogAction(result));
