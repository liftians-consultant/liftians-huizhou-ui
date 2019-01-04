import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Icon } from 'semantic-ui-react';

const WarningModal = ({ open, onClose, headerText, contentText }) => (
  <Modal
    open={open}
    onClose={onClose}
    size="tiny"
    style={{ marginTop: '20%', marginLeft: 'auto', marginRight: 'auto' }}
  >
    <Modal.Header>
      <Icon name="warning circle" size="large" />
      {' '}
      { headerText }
    </Modal.Header>
    <Modal.Content>
      <p>{ contentText }</p>
    </Modal.Content>
  </Modal>
);


WarningModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  headerText: PropTypes.string.isRequired,
  contentText: PropTypes.string.isRequired,
};

export default WarningModal;
