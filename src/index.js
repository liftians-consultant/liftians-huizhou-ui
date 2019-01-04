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
    store.dispatch(userLoggedIn('user'));
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
