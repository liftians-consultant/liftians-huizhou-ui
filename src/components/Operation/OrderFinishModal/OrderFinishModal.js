import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input } from 'semantic-ui-react';
import BinGroup from '../BinGroup/BinGroup';
import './OrderFinishModal.css';

class OrderFinishModal extends Component {
  constructor(props) {
    super(props);

    this.binInputRef = React.createRef();
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.modalOpen !== this.props.modalOpen && this.props.modalOpen === true) {
      setTimeout(() => {
        this.binInputRef.current.inputRef.value = '';
        this.binInputRef.current.focus();
      }, 0);
    }
  }

  handleInputChange(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();
      setTimeout(() => {
        const binBarcode = e.target.value;
        this.binInputRef.current.inputRef.value = '';
        this.binInputRef.current.focus();
        this.props.onInputEnter(binBarcode, this.props.data.binNum);
      }, 300);
    }
  }

  render() {
    const { data, modalOpen } = this.props;

    return (
      <Modal
        open={modalOpen}
        onOpen={this.handleOnOpen}
        size="small"
        basic
        style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto' }}
        className="order-finish-modal-container"
      >
        <Modal.Header>
          <h1 className="modal-header">
Order #
            { data.orderNo }
            {' '}
completed
          </h1>
        </Modal.Header>
        <Modal.Content scrolling>
          <BinGroup openedBinNum={data.binNum} highlightColor="#4A7AFE" />
          <h2>Please replaced the highlighed bin with an empty bin</h2>
          <h2>Please scan the bin</h2>
          <br />
          <Input
            onKeyPress={this.handleInputChange}
            ref={this.binInputRef}
          />
        </Modal.Content>
      </Modal>
    );
  }
}

OrderFinishModal.propTypes = {
  data: PropTypes.shape({
    binNum: PropTypes.number,
    orderNo: PropTypes.string,
  }).isRequired,
  modalOpen: PropTypes.bool.isRequired,
  onInputEnter: PropTypes.func.isRequired,
};

export default OrderFinishModal;
