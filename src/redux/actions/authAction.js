import { USER_LOGGED_IN, USER_LOGGED_OUT } from 'redux/types';
import api from 'api';
import setAuthorizationHeader from 'utils/setAuthorizationHeader';
import { toast } from 'react-toastify';

export const userLoggedIn = user => ({
  type: USER_LOGGED_IN,
  user,
});

export const userLoggedOut = () => ({
  type: USER_LOGGED_OUT,
});

export const login = credentials => dispatch => api.user.login(credentials)
  .then((res) => {
    if (res.result === '1') {
      localStorage.liftiansJWT = res.data.token;
      setAuthorizationHeader(res.data.token);
      const user = {
        token: res.data.token,
        username: credentials.username,
      };
      dispatch(userLoggedIn(user));
    } else if (res.result === '404') {
      toast.error(res.data);
    }
  });

export const logout = () => dispatch => new Promise((resolve) => {
  localStorage.removeItem('liftiansJWT');
  setAuthorizationHeader();
  dispatch(userLoggedOut());
  resolve(true);
});

// export const confirm = token => dispatch =>
//   api.user.confirm(token).then(user => {
//     localStorage.bookwormJWT = user.token;
//     dispatch(userLoggedIn(user));
//   });

// export const resetPasswordRequest = ({ email }) => () =>
//   api.user.resetPasswordRequest(email);

export const validateToken = token => () => api.user.validateToken(token);

// export const resetPassword = data => () => api.user.resetPassword(data);
