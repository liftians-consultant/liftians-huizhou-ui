import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Button } from 'semantic-ui-react';
import PodShelf from 'components/common/PodShelf/PodShelf';

const PodShelfInfo = props => (
  <div className="pod-shelf-info-display-container">
    <div className="pod-info-block">
      <span>{`Pod #${props.podInfo.podId} - ${props.podInfo.podSide === 0 ? 'A' : 'B'} (${props.podInfo.locationBarcode})`}</span>
      <br />
    </div>
    <Segment.Group>
      <Segment>
        <PodShelf podInfo={props.podInfo} highlightBox={props.highlightBox} />
      </Segment>
    </Segment.Group>
    {props.showAdditionBtns && (
    <div>
      <Button color="red" onClick={props.onShortageClicked}>Shortage</Button>
    </div>
    )}
  </div>
);

PodShelfInfo.propTypes = {
  podInfo: PropTypes.object.isRequired,
  highlightBox: PropTypes.object.isRequired,
  onShortageClicked: PropTypes.func,
  showAdditionBtns: PropTypes.bool,
};

PodShelfInfo.defaultProps = {
  showAdditionBtns: false,
  onShortageClicked: () => {},
};

export default PodShelfInfo;
