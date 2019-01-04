import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';
import MenuButton from 'components/common/MenuButton/MenuButton';

class GenerateDataPage extends Component {
  state = {

  };

  constructor(props) {
    super(props);
    this.goToPage = this.goToPage.bind(this);
  }

  goToPage(name) {
    console.log(name);
    this.props.history.push(name);
  }

  render() {
    return (
      <div className="ui container generate-data-page-container menu-page">
        {/* <Button onClick={ () => this.backBtnHandler() }>Go Back</Button> */}
        <Grid columns={4}>
          <Grid.Row>
            <Grid.Column>
              <MenuButton title="Account" name="generate-account" clickHandler={this.goToPage} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Product" name="generate-product" clickHandler={this.goToPage} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Delivery" name="generate-delivery" clickHandler={this.goToPage} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Replenishment" name="generate-replenishment" clickHandler={this.goToPage} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}


GenerateDataPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

function mapStateToProps() {
  return {
  };
}

export default connect(mapStateToProps, {})(GenerateDataPage);
