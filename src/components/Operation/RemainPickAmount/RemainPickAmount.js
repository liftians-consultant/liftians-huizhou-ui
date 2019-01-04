/* eslint-disable */
// un-used component

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class RemainPickAmount extends Component {
  render() {
    return (
      <div className="remain-pick-amount-container">
        <span>Remaining</span>
      </div>
    );
  }
}

RemainPickAmount.propTypes = {
  amount: PropTypes.number.isRequired,
};

export default RemainPickAmount;
