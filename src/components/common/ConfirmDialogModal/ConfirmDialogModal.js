import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Confirm } from 'semantic-ui-react';

class ConfirmDialogModal extends Component {
  clickHandler(confirm) {
    this.props.close(confirm);
  }

  render() {
    const { open, size, header, content } = this.props;

    return (
      <Confirm
        size={size || 'mini'}
        open={open}
        onCancel={() => this.clickHandler(false)}
        onConfirm={() => this.clickHandler(true)}
        header={header || 'Confirm'}
        content={content || 'Are you sure?'}
        style={{ marginTop: '20%', marginLeft: 'auto', marginRight: 'auto' }}
      />
    );
  }
}

ConfirmDialogModal.defaultProps = {
  size: 'mini',
  header: 'Confirm',
  content: 'Are you sure?',
};

ConfirmDialogModal.propTypes = {
  size: PropTypes.string,
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  header: PropTypes.string,
  content: PropTypes.string,
};

export default ConfirmDialogModal;
