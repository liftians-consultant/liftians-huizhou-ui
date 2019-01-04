import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Label, Table } from 'semantic-ui-react';

const TaskListTable = (props) => {
  const tableRows = props.taskList.map(task => (
    <Table.Row key={task.taskID}>
      <Table.Cell>
        <Label>{task.taskID}</Label>
      </Table.Cell>
      <Table.Cell>{ task.taskStatusID }</Table.Cell>
      <Table.Cell>{ task.taskTypeID }</Table.Cell>
      <Table.Cell>{ task.isManual ? 'Yes' : 'No' }</Table.Cell>
      <Table.Cell>{ moment(task.taskCreateTime).format(process.env.REACT_APP_TABLE_DATE_FORMAT_NO_SEC) }</Table.Cell>
      <Table.Cell>{ task.botid }</Table.Cell>
      <Table.Cell>{ task.botStatusID }</Table.Cell>
      <Table.Cell>{ task.podid }</Table.Cell>
      <Table.Cell>{ task.podStatusID }</Table.Cell>
      <Table.Cell>{ task.podrotation }</Table.Cell>
      <Table.Cell>{ task.origin_X / 1000 }</Table.Cell>
      <Table.Cell>{ task.origin_Y / 1000 }</Table.Cell>
      <Table.Cell>{ task.destination_X / 1000 }</Table.Cell>
      <Table.Cell>{ task.destination_Y / 1000 }</Table.Cell>
      <Table.Cell>{ task.priority }</Table.Cell>
      <Table.Cell>{ task.stationID }</Table.Cell>
      <Table.Cell>{ task.pairTaskID }</Table.Cell>
    </Table.Row>
  ));

  return (
    <Table className="task-list-table" celled inverted structured selectable striped>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell rowSpan="2">Task</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">Status</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">Type</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">Manual</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">Create Time</Table.HeaderCell>
          <Table.HeaderCell colSpan="2">Bot</Table.HeaderCell>
          <Table.HeaderCell colSpan="3">Pod</Table.HeaderCell>
          <Table.HeaderCell colSpan="2">Original</Table.HeaderCell>
          <Table.HeaderCell colSpan="2">Destinated</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">Priority</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">Station</Table.HeaderCell>
          <Table.HeaderCell rowSpan="2">PairTask</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Rotation</Table.HeaderCell>
          <Table.HeaderCell>X</Table.HeaderCell>
          <Table.HeaderCell>Y</Table.HeaderCell>
          <Table.HeaderCell>X</Table.HeaderCell>
          <Table.HeaderCell>Y</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        { tableRows }
      </Table.Body>
    </Table>
  );
};

TaskListTable.propTypes = {
  taskList: PropTypes.array.isRequired,
};

export default TaskListTable;
