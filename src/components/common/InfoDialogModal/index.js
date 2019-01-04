import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Icon } from 'semantic-ui-react';

const InfoDialogModal = ({ open, onClose, headerText, contentText }) => (
  <Modal
    open={open}
    onClose={onClose}
    size="tiny"
    style={{ marginTop: '20%', marginLeft: 'auto', marginRight: 'auto' }}
  >
    <Modal.Header>
      <Icon name="info circle" size="large" />
      { headerText }
    </Modal.Header>
    <Modal.Content>
      <p>
        { contentText }
      </p>
    </Modal.Content>
    <Modal.Actions>
      <Button primary onClick={onClose}>
        OK
      </Button>
    </Modal.Actions>
  </Modal>
);

InfoDialogModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  headerText: PropTypes.string.isRequired,
  contentText: PropTypes.string.isRequired,
};

export default InfoDialogModal;
