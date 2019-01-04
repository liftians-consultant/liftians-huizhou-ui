import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import api from 'api';
import erpApi from 'erpApi';
import SubPageContainer from 'components/common/SubPageContainer/SubPageContainer';
import CreateProductForm from 'components/forms/CreateProductForm';

class GenerateProductPage extends Component {
  state = {};

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  submit = sku => erpApi.product.getProduct(sku).then((res) => {
    if (res.success) {
      console.log('Product found', res.account);
      return false;
    }

    return true;
  });

  confirm = data => erpApi.product.createProduct(data).then((response) => {
    if (response.data && response.data.success) {
      toast.success('Product Created in ERP');

      api.erpProcess.product().then((res) => {
        if (res === 1) {
          toast.success('ERP process success.');
        } else {
          toast.error('ERP process failed. Contact Liftians.');
        }
      });
      return true;
    }
    return false;
  });

  render() {
    return (
      <div className="generate-product-page">
        <SubPageContainer
          title="Create Product"
          onBackBtnClicked={this.backBtnHandler}
        >
          <CreateProductForm
            onSubmit={this.submit}
            onConfirm={this.confirm}
          />
        </SubPageContainer>
      </div>
    );
  }
}

GenerateProductPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default GenerateProductPage;
