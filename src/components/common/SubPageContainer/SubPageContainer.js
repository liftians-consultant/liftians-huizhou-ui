import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import './SubPageContainer.css';

const SubPageContainer = props => (
  <div className="sub-page-container">
    <Button onClick={props.onBackBtnClicked}>
      Back
    </Button>
    <div className="page-header-container">
      <span className="page-header">
        {props.title}
      </span>
    </div>
    <div className="page-content-container">
      {props.children}
    </div>
  </div>
);

SubPageContainer.propTypes = {
  title: PropTypes.string.isRequired,
  onBackBtnClicked: PropTypes.func.isRequired,
};

export default SubPageContainer;
