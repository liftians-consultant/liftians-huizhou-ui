import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Button } from 'semantic-ui-react';
import PodShelf from 'components/common/PodShelf/PodShelf';
import OrderDetailListModal from 'components/Operation/OrderDetailListModal/OrderDetailListModal';

const locationBarcodeStyle = {
  display: 'inline-block',
  marginTop: '10px',
};

const PodShelfInfo = props => (
  <div className="pod-shelf-info-display-container">
    <div className="pod-info-block">
      <span>{`Pod #${props.podInfo.podId} - ${props.podInfo.podSide === 0 ? 'A' : 'B'}`}</span>
      <br />
      <span style={locationBarcodeStyle}>{props.podInfo.locationBarcode}</span>
    </div>
    <Segment.Group>
      <Segment>
        <PodShelf podInfo={props.podInfo} highlightBox={props.highlightBox} />
      </Segment>
    </Segment.Group>
    { props.showAdditionBtns && (
    <div>
      { props.orderList.length > 0 && <OrderDetailListModal orderList={props.orderList} /> }
      <Button color="red" onClick={props.onShortageClicked}>Shortage</Button>
    </div>
    )}

  </div>
);

PodShelfInfo.propTypes = {
  podInfo: PropTypes.object.isRequired,
  highlightBox: PropTypes.object.isRequired,
  orderList: PropTypes.array.isRequired,
  onShortageClicked: PropTypes.func.isRequired,
  showAdditionBtns: PropTypes.bool,
};

PodShelfInfo.defaultProps = {
  showAdditionBtns: false,
};

export default PodShelfInfo;
