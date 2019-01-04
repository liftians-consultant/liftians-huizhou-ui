import api from 'api';
import { USER_INFO_FETCHED } from '../types';

export const userInfoFetched = userInfo => ({
  type: USER_INFO_FETCHED,
  userInfo,
});

export const getUserInfoById = empId => dispatch => api.user.getInfoById(empId).then((userInfo) => {
  dispatch(userInfoFetched(userInfo));
});
