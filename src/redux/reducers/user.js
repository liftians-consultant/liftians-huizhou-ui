import { USER_LOGGED_IN, USER_LOGGED_OUT, USER_INFO_FETCHED } from '../types';

export default function user(state = {}, action = {}) {
  switch (action.type) {
    case USER_LOGGED_IN:
      return action.user;
    case USER_LOGGED_OUT:
      return {};
    case USER_INFO_FETCHED:
      return { ...state, info: action.userInfo };
    default:
      return state;
  }
}
