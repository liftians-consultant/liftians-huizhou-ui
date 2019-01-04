import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Grid } from 'semantic-ui-react';

import api from 'api';
import PodShelf from 'components/common/PodShelf/PodShelf';

import './WrongProductModal.css';

class WrongProductModal extends Component {
  state = {
    productLocation: {},
  };

  componentWillMount() {
    this.getWrongProductLocation();
  }

  getWrongProductLocation() {
    const { podInfo, productId } = this.props;

    api.pick.getInventoryByProductBarcode(productId, podInfo.podId, podInfo.podSide).then((res) => {
    // api.pick.getInventoryByProductBarcode('T168000', 33 , 0).then( res => {
      this.setState({ productLocation: res.data[0] });
    });
  }

  render() {
    const { podInfo, open, close } = this.props;
    const { productLocation } = this.state;

    const highlightBox = {
      row: productLocation ? productLocation.shelfID : 0,
      column: productLocation ? productLocation.boxID : 0,
    };

    // const highlightBox = {
    //   row: 4,
    //   column: 1
    // };

    return (
      <Modal
        className="wrong-product-modal-container"
        open={open}
        size="small"
        basic
        style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Modal.Header><h1 className="modal-header">WRONG PRODUCT</h1></Modal.Header>
        <Modal.Content scrolling>
          <Grid>
            <Grid.Row>
              <Grid.Column width={8}>
                <PodShelf podInfo={podInfo} highlightBox={highlightBox} />
              </Grid.Column>
              <Grid.Column width={8}>
                <h2>Please place the product back to the position</h2>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            size="massive"
            onClick={close}
          >
            Ok
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

WrongProductModal.propTypes = {
  podInfo: PropTypes.object.isRequired,
  productId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export default WrongProductModal;
