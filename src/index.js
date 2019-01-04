import React from 'react';
import ReactDOM from 'react-dom';
import { Route, HashRouter } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import decode from 'jwt-decode';
import { composeWithDevTools } from 'redux-devtools-extension'; // eslint-disable-line
import './i18n'; // i18n support


import App from 'containers/App';
import rootReducer from 'redux/reducers/rootReducer';
import { userLoggedIn, userLoggedOut } from 'redux/actions/authAction';
import setAuthorizationHeader from 'utils/setAuthorizationHeader';
import appConfig from 'services/AppConfig';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk)),
);

if (localStorage.liftiansJWT) {
  if (process.env.REACT_APP_ENV === 'PRODUCTION') {
    // production env
    localStorage.removeItem('liftiansJWT');
    setAuthorizationHeader();
  } else {
    // development env
    // check if expired
    const payload = decode(localStorage.liftiansJWT); // {sub: "10001", exp: 1519504053}
    const nowDate = new Date();
    const tokenDate = new Date(payload.exp);
    if (nowDate.getTime() < tokenDate.getTime()) {
      localStorage.removeItem('liftiansJWT');
      setAuthorizationHeader();
      store.dispatch(userLoggedOut());
    } else {
      const user = {
        token: localStorage.liftiansJWT,
        username: payload.sub,
      };
      setAuthorizationHeader(localStorage.liftiansJWT);
      store.dispatch(userLoggedIn(user));
    }
  }
}

/* Set api server and station info if missing */
if (localStorage.apiHost && localStorage.apiPort) {
  appConfig.setApiUrl(localStorage.apiHost, localStorage.apiPort);
}

if (localStorage.stationId) {
  appConfig.setStationId(localStorage.stationId);
}

ReactDOM.render(
  <HashRouter>
    <Provider store={store}>
      <Route component={App} />
    </Provider>
  </HashRouter>,
  document.getElementById('root'),
);
registerServiceWorker();
