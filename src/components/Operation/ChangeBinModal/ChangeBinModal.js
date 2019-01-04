import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, Button } from 'semantic-ui-react';
import BinGroup from 'components/Operation/BinGroup/BinGroup';
// import ETagService from 'services/ETagService';
import { toast } from 'react-toastify';
import './ChangeBinModal.css';

class ChangeBinModal extends Component {
  state = {
    selectedBin: 0,
    selectedHolder: 0,
  }

  constructor() {
    super();

    this.holderScanInput = React.createRef();
    this.binScanInput = React.createRef();
    this.onBinClicked = this.onBinClicked.bind(this);
    this.handleHolderScanInputChange = this.handleHolderScanInputChange.bind(this);
    this.handleBinScanInputChange = this.handleBinScanInputChange.bind(this);
    // this.checkDeviceIsValid = this.checkDeviceIsValid.bind(this);
    this.handleRescanClick = this.handleRescanClick.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open && this.props.open === true) {
      setTimeout(() => {
        this.handleRescanClick();
      }, 0);
    }
  }

  focusBinScanInput() {
    this.binScanInput.current.inputRef.value = '';
    this.binScanInput.current.focus();
  }

  focusHolderScanInput() {
    this.holderScanInput.current.inputRef.value = '';
    this.holderScanInput.current.focus();
  }


  handleRescanClick() {
    this.setState({ selectedHolder: 0, selectedBin: 0 }, () => {
      setTimeout(() => {
        this.focusHolderScanInput();
      }, 100);
    });
  }

  handleOnClose() {
    this.setState({ selectedHolder: 0, selectedBin: 0 }, () => {
      this.props.onClose();
    });
  }

  /* Bin Group clicked */
  onBinClicked(binLocation) {
    const holder = this.props.deviceList.find(device => device.deviceIndex === binLocation);
    if (holder) {
      this.setState({ selectedHolder: holder.deviceId, selectedBin: binLocation }, () => {
        setTimeout(() => {
          // ETagService.turnEndLightOnById(binLocation);
          this.focusBinScanInput();
        }, 100);
      });
    } else {
      toast.warn('Invalid Bin');
    }
  }

  /* Manually scan holder barcode */
  handleHolderScanInputChange(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();
      setTimeout(() => {
        const holder = this.props.deviceList.find(device => device.deviceId === parseInt(e.target.value, 10));
        if (holder) {
          this.setState({ selectedHolder: holder.deviceId, selectedBin: holder.deviceIndex }, () => {
            setTimeout(() => {
              // ETagService.turnEndLightOnById(holder.deviceIndex);
              console.log(this.state.holderIndex);
              this.focusBinScanInput();
            }, 200);
          });
        } else {
          toast.warn('Invalid Holder');
        }
      }, 300);
    }
  }

  handleBinScanInputChange(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();
      setTimeout(() => {
        const holderId = e.target.value;
        this.props.onChangeBinCallback(this.state.selectedHolder, holderId);
      }, 300);
    }
  }

  renderContent() {
    if (this.state.selectedHolder === 0) {
      return (
        <div>
          <div className="info-text">Please select or scan which bin you want to replace</div>
          <Input
            onKeyPress={this.handleHolderScanInputChange}
            ref={this.holderScanInput}
          />
        </div>
      );
    }
    return (
      <div>
        <div className="info-text">Replace a new bin then scan barcode</div>
        <Input
          onKeyPress={this.handleBinScanInputChange}
          ref={this.binScanInput}
        />
        <Button onClick={this.handleRescanClick}>Re-scan Holder</Button>
      </div>
    );
  }

  render() {
    return (
      <Modal
        className="change-bin-modal-container"
        size="fullscreen"
        open={this.props.open}
        onClose={this.handleOnClose}
        style={{ marginTop: '10%', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Modal.Header>Change Bin</Modal.Header>
        <Modal.Content>
          {this.renderContent()}
          <BinGroup highlightColor="blue" openedBinNum={this.state.selectedBin} size="150" onBinClicked={this.onBinClicked} />
        </Modal.Content>
      </Modal>
    );
  }
}

ChangeBinModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChangeBinCallback: PropTypes.func.isRequired,
  deviceList: PropTypes.array.isRequired,
  // location: PropTypes.number.isRequired,
};

export default ChangeBinModal;
