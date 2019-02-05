import {
  FETCH_TASK_STATUS_SUCCESS,
  FETCH_TASK_STATUS_FAILURE,
  FETCH_CANCEL_REASON_SUCCESS,
  FETCH_CANCEL_REASON_FAILURE,
} from 'redux/types';
import api from 'api';
import { toast } from 'react-toastify';
import _ from 'lodash';

export const fetchTaskStatusSuccessAction = taskStatusList => ({
  type: FETCH_TASK_STATUS_SUCCESS,
  taskStatusList,
});

export const fetchTaskStatusFailureAction = () => ({
  type: FETCH_TASK_STATUS_FAILURE,
});

export const fetchCancelReasonSuccessAction = cancelReasonList => ({
  type: FETCH_TASK_STATUS_SUCCESS,
  cancelReasonList,
});

export const fetchCancelReasonFailureAction = () => ({
  type: FETCH_TASK_STATUS_FAILURE,
});

export const getTaskStatus = () => (dispatch, getState) => new Promise((resolve) => {
  if (!_.isEmpty(getState().status.taskStatusList)) {
    resolve(true);
  }

  api.status.getTaskStatus().then((res) => {
    if (res.success) {
      const mappedList = _.keyBy(res.data, 'id');
      dispatch(fetchTaskStatusSuccessAction(mappedList));
      resolve(true);
    } else {
      dispatch(fetchTaskStatusFailureAction());
      resolve(false);
    }
  }).catch(() => {
    toast.error('[SERVER ERROR] Error while fetching task status list.');
    dispatch(fetchTaskStatusFailureAction());
    resolve(false);
  });
});

export const getCancelReasonList = () => (dispatch, getState) => new Promise((resolve) => {
  if (!_.isEmpty(getState().status.cancelReasonList)) {
    resolve(true);
  }

  api.status.getCancelReason().then((res) => {
    if (res.success) {
      const mappedList = _.keyBy(res.data, 'id');
      dispatch(fetchCancelReasonSuccessAction(mappedList));
      resolve(true);
    } else {
      dispatch(fetchCancelReasonFailureAction());
      resolve(false);
    }
  }).catch(() => {
    toast.error('[SERVER ERROR] Error while fetching task status list.');
    dispatch(fetchCancelReasonFailureAction());
    resolve(false);
  });
});
