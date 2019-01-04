import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import moment from 'moment';
import api from 'api';
import OrderDetailsTableColumn from 'models/OrderDetailsTableColumn';
import ReplenishDetailTableColumns from 'models/ReplenishDetailTableColumns';
import './OrderDetailTable.css';

class OrderDetailTable extends Component {
  state = {
    recordDetails: [],
    loading: false,
  }

  locale = process.env.REACT_APP_LOCALE;

  componentWillMount() {
    this.getRecords();
  }

  getRecords() {
    this.setState({ loading: true });

    if (this.props.taskType === 'P') {
      api.pick.retrievePickOrderItems(this.props.recordId).then((res) => {
        console.log(`[PICK ORDER DETAIL] RecordId: ${this.props.recordId}`, res.data);
        res.data.map((object) => {
          object.pick_DATE = moment(object.pick_DATE).format(process.env.REACT_APP_TABLE_DATE_FORMAT);
          object.processStatus = this.locale === 'CHN' ? object.processStatusCHN : object.processStatus;
          return object;
        });
        this.setState({ recordDetails: res.data, loading: false });
      });
    } else if (this.props.taskType === 'R') {
      api.replenish.DisplayReplenishDetail(this.props.recordId).then((res) => {
        console.log(`[REPLENISH ORDER DETAIL] RecordId: ${this.props.recordId}`, res.data);
        res.data.map((object) => {
          object.pick_DATE = moment(object.pick_DATE).format(process.env.REACT_APP_TABLE_DATE_FORMAT);
          object.processStatus = this.locale === 'CHN' ? object.processStatusCHN : object.processStatus;
          return object;
        });
        this.setState({ recordDetails: res.data, loading: false });
      });
    }
  }

  render() {
    const { loading, recordDetails } = this.state;
    const columns = this.props.taskType === 'P' ? OrderDetailsTableColumn : ReplenishDetailTableColumns;
    return (
      <div className="orderDetailTableContainer">
        <ReactTable
          columns={columns}
          data={recordDetails}
          loading={loading}
          manual
          defaultPageSize={1}
          resizable={false}
          filterable={false}
          showPageJump={false}
          showPagination={false}
          className="-striped -highlight"
        />
      </div>
    );
  }
}

OrderDetailTable.propTypes = {
  recordId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  taskType: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

export default OrderDetailTable;
