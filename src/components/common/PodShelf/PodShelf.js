import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './PodShelf.css';

const PodShelf = ({ podInfo, highlightBox }) => {
  const shelfRowAmount = podInfo.shelfBoxes.length;

  // create shelf html
  const shelfElement = podInfo.shelfBoxes.map((boxAmount, index) => {
    const shelfObject = [];
    _.times(boxAmount, (i) => {
      let isHighlight = false;

      // determine which box to highlight
      // if (highlightBox) {
      isHighlight = (highlightBox.row === (shelfRowAmount - index)) && highlightBox.column === (i + 1);
      // }

      shelfObject.push(
        <div
          key={`shelf${index}box${i}`}
          className={`shelf-object shelf-row-${highlightBox.row === shelfRowAmount - index ? index + 1 : 'disabled'}`}
          style={{ width: `${1 / boxAmount * 100}%` }}
        >
          { isHighlight && <div className="selected-box" /> }
        </div>,
      );
    });

    return (<div className="shelf-row" key={index}>{ shelfObject }</div>);
  });

  return (
    <div className="pod-shelf-container">
      { shelfElement }
    </div>
  );
};

PodShelf.propTypes = {
  podInfo: PropTypes.object.isRequired,
  highlightBox: PropTypes.object.isRequired,
};

export default PodShelf;
