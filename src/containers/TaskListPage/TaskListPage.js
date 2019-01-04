import React, { Component } from 'react';

import api from 'api';
import './TaskListPage.css';
import TaskListTable from 'components/TaskListTable/TaskListTable';

class TaskListPage extends Component {
  state = {
    taskList: [],
  }

  componentWillMount() {
    api.system.getTaskList().then((res) => {
      if (res.data) {
        console.log('[TASK LIST] Get task list', res.data);
        this.setState({ taskList: res.data });
      }
    });
  }

  render() {
    const { taskList } = this.state;

    return (
      <div className="task-list-page-container">
        <div className="page-header">
          <span>Task List</span>
        </div>
        <div className="task-list-table-container page-content-container">
          <TaskListTable taskList={taskList} />
        </div>
      </div>
    );
  }
}

// TaskListPage.propTypes = {

// };

export default TaskListPage;
