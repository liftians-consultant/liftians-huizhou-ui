import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import SideNavigation from '../navigation/SideNavigation';

const UserRoute = ({ isAuthenticated, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (isAuthenticated ? (
      <Grid padded={false} relaxed={false}>
        <Grid.Row stretched>
          <Grid.Column width={14}>
            <Component {...props} />
          </Grid.Column>
          <Grid.Column width={2} className="navGridColumn">
            <SideNavigation />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    ) : <Redirect to="/login" />)}
  />
);

UserRoute.propTypes = {
  component: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.token,
  };
}

export default connect(mapStateToProps)(UserRoute);
