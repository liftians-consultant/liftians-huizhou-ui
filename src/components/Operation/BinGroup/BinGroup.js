/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './BinGroup.css';

class BinGroup extends Component {
  state = {
    binAmount: process.env.REACT_APP_BOX_AMOUNT,
  };


  constructor() {
    super();

    this.handleBinClicked = this.handleBinClicked.bind(this);
  }

  handleBinClicked(index) {
    if (this.props.onBinClicked) {
      this.props.onBinClicked(index + 1);
    }
  }

  render() {
    const { binAmount } = this.state;
    const { openedBinNum, highlightColor } = this.props;
    const color = highlightColor || 'red';
    const binElements = [];
    let size = 110;
    if (this.props.size) {
      size = this.props.size;
    }

    const styles = {
      pickBinsContainer: {
        height: `${size}px`,
      },
      binItemContainer: {
        height: `${size}px`,
        width: `${size}px`,
      },
      binItem: {
        lineHeight: `${size}px`,
      },
    };


    _.times(binAmount, (index) => {
      binElements.push(
        <div key={`bin-${index}`} className="bin-item-container" style={styles.binItem}>
          <div
            className={`bin-item ${(index + 1 === openedBinNum) ? 'highlight' : ''}`}
            style={styles.binItemContainer}
            onClick={() => this.handleBinClicked(index)}
          >
            {index + 1}
          </div>
        </div>,
      );
    });

    return (
      <div className="pick-bins-container" style={styles.pickBinsContainer}>
        <style>
          {`
          .highlight {
            background: ${color};
          }
        `}
        </style>
        { binElements }
      </div>
    );
  }
}

BinGroup.propTypes = {
  openedBinNum: PropTypes.number,
  highlightColor: PropTypes.string,
  size: PropTypes.string,
  onBinClicked: PropTypes.func,
};

export default BinGroup;
