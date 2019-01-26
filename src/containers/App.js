import React from 'react';
import { Switch } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';

import GuestRoute from 'components/routes/GuestRoute';
import UserRoute from 'components/routes/UserRoute';

import HomePage from 'containers/HomePage';
import LoginPage from 'containers/LoginPage';
import PickTaskPage from 'containers/PickTaskPage/PickTaskPage';
import PickOperationPage from 'containers/PickOperationPage/PickOperationPage';
import SystemSettingPage from 'containers/SystemSettingPage/SystemSettingPage';
import ReplenishTaskPage from 'containers/ReplenishTaskPage/ReplenishTaskPage';
import ReplenishOperationPage from 'containers/ReplenishOperationPage/ReplenishOperationPage';
import InventorySearchPage from 'containers/InventorySearchPage/InventorySearchPage';
import TaskListPage from 'containers/TaskListPage/TaskListPage';
import BusinessRulesPage from 'containers/BusinessRulesPage/BusinessRulesPage';
import ExpireRuleConfigPage from 'containers/ExpireRuleConfigPage/ExpireRuleConfigPage';
import GenerateDataPage from 'containers/GenerateDataPage/GenerateDataPage';
import GenerateAccountPage from 'containers/GenerateAccountPage/GenerateAccountPage';
import GenerateProductPage from 'containers/GenerateProductPage/GenerateProductPage';
import GenerateDeliveryPage from 'containers/GenerateDeliveryPage/GenerateDeliveryPage';
import GenerateReplenishmentPage from 'containers/GenerateReplenishmentPage/GenerateReplenishmentPage';
import ChangeLanguagePage from 'containers/ChangeLanguagePage/ChangeLanguagePage';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => (
  <div className="app-comp-container">
    <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnVisibilityChange
      draggable
      draggablePercent={60}
      pauseOnHover
    />
    <Switch>
      <UserRoute path="/pick-task" exact component={PickTaskPage} />
      <UserRoute path="/operation" exact component={PickOperationPage} />
      <UserRoute path="/system-setting" exact component={SystemSettingPage} />
      <UserRoute path="/replenish-task" exact component={ReplenishTaskPage} />
      <UserRoute path="/replenish-operation" exact component={ReplenishOperationPage} />
      <UserRoute path="/inventory-search" exact component={InventorySearchPage} />
      <UserRoute path="/task-list" exact component={TaskListPage} />
      <UserRoute path="/business-rules" exact component={BusinessRulesPage} />
      <UserRoute path="/expire-rule-config" exact component={ExpireRuleConfigPage} />
      <UserRoute path="/generate-data" exact component={GenerateDataPage} />
      <UserRoute path="/generate-account" exact component={GenerateAccountPage} />
      <UserRoute path="/generate-product" exact component={GenerateProductPage} />
      <UserRoute path="/generate-delivery" exact component={GenerateDeliveryPage} />
      <UserRoute path="/generate-replenishment" exact component={GenerateReplenishmentPage} />
      <UserRoute path="/language" exact component={ChangeLanguagePage} />
      <GuestRoute path="/login" component={LoginPage} />
      <UserRoute path="/" exact component={HomePage} />
    </Switch>
  </div>
);

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.username,
  };
}

export default connect(mapStateToProps)(App);
