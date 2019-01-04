import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Button } from 'semantic-ui-react';
import MenuButton from 'components/common/MenuButton/MenuButton';

class BusinessRulesPage extends Component {
  state = {
  }

  constructor(props) {
    super(props);
    this.goToPage = this.goToPage.bind(this);
  }

  goToPage = (name) => {
    console.log(name);
    this.props.history.push(name);
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  render() {
    return (
      <div className="ui container business-rule-page-container menu-page">
        <Button onClick={() => this.backBtnHandler()}>Back</Button>
        <Grid columns={1}>
          <Grid.Row>
            <Grid.Column>
              <MenuButton title="Expire Rule" name="expire-rule-config" clickHandler={this.goToPage} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}


BusinessRulesPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    stationId: state.station.id,
  };
}

export default connect(mapStateToProps, {})(BusinessRulesPage);
