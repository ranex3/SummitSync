import '../App.css';
import React from 'react';
import { auth, db } from "../firebase";
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore"
import { useNavigate, useParams } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function Conference() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = React.useState('');
  const { cid } = useParams();
  const [startDate, setStartDate] = React.useState(dayjs());
  const [endDate, setEndDate] = React.useState(dayjs());
  const [taskName, setTaskName] = React.useState('');
  const [taskDesc, setTaskDesc] = React.useState('');
  const [taskList, setTaskList] = React.useState([]);
  const [currTid, setCurrTid] = React.useState('');
  const [assigneeList, setAssigneeList] = React.useState([]);
  const [assignableList, setAssignableList] = React.useState([]);
  const [confName, setConfName] = React.useState('')

  // form dialog status variables
  const [createTaskOpen, setCreateTaskOpen] = React.useState(false);
  const [assigneesOpen, setAssigneesOpen] = React.useState(false);
  const [unassignOpen, setUnassignOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);

  // handles menu functionality
  const goToTasks = () => {
    navigate(`/conference/${cid}`);
  }

  const goToVolunteers = () => {
    navigate(`/conference/${cid}/volunteers`);
  }

  const goToForum = () => {
    navigate(`/conference/${cid}/forum`);
  }

  const goToSchedule = () => {
    navigate(`/conference/${cid}/schedule`);
  }

  const goToApplications = () => {
    navigate(`/conference/${cid}/applications`);
  }

  const goToMyTasks = () => {
    navigate(`/conference/${cid}/myTasks`)
  }

  const goToLogAttendance = () => {
    navigate(`/conference/${cid}/logAttendance`);
  }

  const goToViewAttendance = () => {
    navigate(`/conference/${cid}/viewAttendance`);
  }

  const goToMyFeedback = () => {
    navigate(`/conference/${cid}/myFeedback`);
  }

  // create task dialog handlers
  const handleCreateTaskOpen = () => {
    setCreateTaskOpen(true);
  };

  const handleCreateTaskClose = (addTask) => {
    if (addTask === true) {
      createTask();
    }

    // set input fields to default
    setStartDate(dayjs());
    setEndDate(dayjs());
    setTaskName('');
    setTaskDesc('');

    setCreateTaskOpen(false);
  };

  // view assignees dialog handlers
  const handleAssigneesOpen = async (taskId) => {
    // set current task id to taskId - this will cause useffect to re-render assignee list for current task
    setCurrTid(taskId);

    // open 'view assignees' dialog
    setAssigneesOpen(true);
  };

  const handleAssigneesClose = () => {
    // close 'view assignees' dialog
    setAssigneesOpen(false);
  };

  // 'unassign' dialog handlers
  const handleUnassignOpen = async (taskId) => {
    // set current task id to taskId - this will cause useffect to re-render assignee list for current task
    setCurrTid(taskId);

    // open 'unassign' dialog
    setUnassignOpen(true);
  };

  const handleUnassignClose = () => {
    // close 'unassign' dialog
    setUnassignOpen(false);
  };

  // 'assign' dialog handlers
  const handleAssignOpen = async (taskId) => {
    // set current task id to taskId - this will cause useffect to re-render assignee list for current task
    setCurrTid(taskId);

    // open 'assign' dialog
    setAssignOpen(true);
  };

  const handleAssignClose = () => {
    // close 'assign' dialog
    setAssignOpen(false);
  };

  // get current conference details
  React.useEffect(() => {
    async function getConfDetails() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch(`http://localhost:8001/conference/details?cid=${cid}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer: ${token}`
            }
          });

          if (!response.ok) {
            console.error('Failed to fetch conferences details. Status', response.status);
            return;
          }

          const data = await response.json();
          setConfName(data.conference.name)
        }
      })
    }

    getConfDetails()
  }, [cid])

  // create task
  async function createTask() {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    await fetch(`http://localhost:8001/task/create_task?cid=${cid}&task_name=${taskName}&task_description=${taskDesc}&date_time_start=${startDate.format('DD/MM/YYYY H:m:s')}&date_time_end=${endDate.format('DD/MM/YYYY H:m:s')}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // update taskList
    const response = await fetch(`http://localhost:8001/task/get_all_tasks?cid=${cid}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setTaskList(data.tasks);
  }

  // sign up for task
  async function signUpForTask(tid) {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    await fetch(`http://localhost:8001/task/sign_up_task?cid=${cid}&tid=${tid}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // unassign user from task
  async function unassignUser(uid) {
    const user = auth.currentUser;
    const token = await getIdToken(user);

    // remove user from task
    await fetch(`http://localhost:8001/task/unassign_task?cid=${cid}&tid=${currTid}&uid=${uid}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // update assigneeList for task
    const response = await fetch(`http://localhost:8001/task/get_all_assigned_users?cid=${cid}&tid=${currTid}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get tasks. Status:', response.status);
    }

    const data = await response.json();
    setAssigneeList(data.users_infos);

    // update assignableList for task
    const response2 = await fetch(`http://localhost:8001/task/get_all_unassigned_users?cid=${cid}&tid=${currTid}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response2.ok) {
      console.error('Failed to get assignable volunteers. Status:', response2.status);
    }

    const data2 = await response2.json();
    setAssignableList(data2.users_infos);
  }

  // assign user to task
  async function assignUser(uid) {
    const user = auth.currentUser;
    const token = await getIdToken(user);

    // add user to task
    await fetch(`http://localhost:8001/task/assign_task?cid=${cid}&tid=${currTid}&uid=${uid}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // update assigneeList for task
    const response = await fetch(`http://localhost:8001/task/get_all_assigned_users?cid=${cid}&tid=${currTid}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get tasks. Status:', response.status);
    }

    const data = await response.json();
    setAssigneeList(data.users_infos);

    // update assignableList for task
    const response2 = await fetch(`http://localhost:8001/task/get_all_unassigned_users?cid=${cid}&tid=${currTid}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response2.ok) {
      console.error('Failed to get assignable volunteers. Status:', response2.status);
    }

    const data2 = await response2.json();
    setAssignableList(data2.users_infos);
  }

  // delete event from schedule
  async function deleteTask(taskId) {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/task/remove_task?cid=${cid}&tid=${taskId}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to delete task. Status:', response.status);
    } else {
      // update taskList
      const res = await fetch(`http://localhost:8001/task/get_all_tasks?cid=${cid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTaskList(data.tasks);
    }
  }

  // get all tasks in conference when page renders
  React.useEffect(() => {
    async function getTasks() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch(`http://localhost:8001/task/get_all_tasks?cid=${cid}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.error('Failed to get tasks. Status:', response.status);
          }

          const data = await response.json();
          setTaskList(data.tasks);
        }
      })
    }

    getTasks();
  }, [cid]);

  // get all assignees of current task, and all volunteers who can be assigned to current task
  React.useEffect(() => {
    async function getAssignees() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);

          // get all assignees for current task
          const response = await fetch(`http://localhost:8001/task/get_all_assigned_users?cid=${cid}&tid=${currTid}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.error('Failed to get assignees. Status:', response.status);
          }

          const data = await response.json();
          setAssigneeList(data.users_infos);

          // get all assignable volunteers for current task
          const response2 = await fetch(`http://localhost:8001/task/get_all_unassigned_users?cid=${cid}&tid=${currTid}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response2.ok) {
            console.error('Failed to get assignable volunteers. Status:', response2.status);
          }

          const data2 = await response2.json();
          setAssignableList(data2.users_infos);
        }
      })
    }

    if (currTid !== '') {
      getAssignees();
    }
  }, [currTid, cid]);

  // Check if the user is not authenticated, and if so, navigate to the login page
  React.useEffect(() => {
    const currUserInfo = onAuthStateChanged(auth, (user) => {
      if (!user) {
          navigate('/login')
      } else {
        const fetchAdditionalData = async () => {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAccountType(userData.account_type);
          } else {
            console.log("No additional data for this user in database");
          }
        }
        fetchAdditionalData();
      }
    });

    return () => {
      currUserInfo();
    };
  }, [navigate]);

  return (
    <div>
      <div>
          <HeaderBar />
          <p className='page-name'> Conference: {confName}</p>
      </div>
      <div className='conf-container'>
        <Sidebar>
          <Menu>
            <MenuItem className="menuItems" onClick={goToTasks}>Tasks</MenuItem>
            <MenuItem className="menuItems" onClick={goToVolunteers}>Volunteers</MenuItem>
            <MenuItem className="menuItems" onClick={goToForum}>Forum</MenuItem>
            <MenuItem className="menuItems" onClick={goToSchedule}>Schedule</MenuItem>
            {accountType === 'organiser' ? <MenuItem className="menuItems" onClick={goToApplications}>Applications</MenuItem> : null}
            {accountType !== 'organiser' ? <MenuItem className="menuItems" onClick={goToMyTasks}>My Tasks</MenuItem> : null}
            {accountType !== 'organiser' ? <MenuItem className="menuItems" onClick={goToLogAttendance}>Log Attendance</MenuItem> : null}
            {accountType !== 'volunteer' ? <MenuItem className="menuItems" onClick={goToViewAttendance}>View Attendance</MenuItem> : null}
            {accountType !== 'organiser' ? <MenuItem className="menuItems" onClick={goToMyFeedback}>My Feedback</MenuItem> : null}
          </Menu>
        </Sidebar>
        <div className='conf-page'>
          <h2>Tasks</h2>
          {accountType === 'organiser' ? <Button variant="contained" size="small" onClick={handleCreateTaskOpen} >Create Task</Button> : null}
          <br></br>
          <br></br>
          {taskList?.map((task, index) => {
            return (
              <div key={index} >
                <Card sx={{ minWidth: 800, border: '1px solid' }} variant="outlined" >
                  <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      Starts at: {task.date_time_start}, Finishes at: {task.date_time_end}
                    </Typography>

                    <Typography variant="h5">
                      {task.task_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.task_description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {accountType !== 'organiser' ? <Button size="small" onClick={() => signUpForTask(task.tid)}>Sign Up</Button> : null}
                    <Button size="small" onClick={() => handleAssigneesOpen(task.tid)}>View Assignees</Button>
                    {accountType === 'organiser' ? <Button size="small" onClick={() => handleUnassignOpen(task.tid)}>Unassign</Button> : null}
                    {accountType === 'organiser' ? <Button size="small" onClick={() => handleAssignOpen(task.tid)}>Assign</Button> : null}
                    {accountType === 'organiser' ? <Button size="small" onClick={() => deleteTask(task.tid)}>Delete Task</Button> : null}
                  </CardActions>
                </Card>
                <br></br>
              </div>
            );
          })}
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Dialog open={createTaskOpen} >
            <DialogTitle>Create New Task</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Add a new task to conference
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Task Name"
                    fullWidth
                    variant="standard"
                    value={taskName}
                    onChange={(e) => setTaskName(String(e.target.value))}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    label="Description"
                    fullWidth
                    variant="standard"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                />
                <br></br>
                <br></br>
                <DateTimePicker
                  label="Start Date & Time"
                  value={startDate}
                  onChange={(newDate) => setStartDate(newDate)}
                  format="DD/MM/YYYY H:m"
                />
                <DateTimePicker
                  label="End Date & Time"
                  value={endDate}
                  onChange={(newDate) => setEndDate(newDate)}
                  format="DD/MM/YYYY H:m"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleCreateTaskClose(false)}>Cancel</Button>
                <Button onClick={() => handleCreateTaskClose(true)}>Add Task</Button>
            </DialogActions>
        </Dialog>
      </LocalizationProvider>

      <Dialog open={assigneesOpen} fullWidth={true} maxWidth={'xs'} onClose={() => handleAssigneesClose()} >
          <DialogTitle>Assignees</DialogTitle>
          <DialogContent>
              {assigneeList?.map((user, index) => {
                return <div key={index}>
                      <DialogContentText>{user.first_name} {user.last_name}</DialogContentText>
                  </div>
              })}
          </DialogContent>
      </Dialog>

      <Dialog open={unassignOpen} fullWidth={true} maxWidth={'xs'} onClose={() => handleUnassignClose()} >
          <DialogTitle>Assignees</DialogTitle>
          <DialogContent>
              {assigneeList?.map((user, index) => {
                return <div key={index}>
                      <DialogContentText>
                        {user.first_name} {user.last_name} <span></span>
                        <Button size="small" variant="contained" color="error" onClick={() => unassignUser(user.uid)} >Unassign</Button>
                      </DialogContentText>
                      <br></br>
                  </div>
              })}
          </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} fullWidth={true} maxWidth={'xs'} onClose={() => handleAssignClose()} >
          <DialogTitle>Assignees</DialogTitle>
          <DialogContent>
            {assignableList?.map((user, index) => {
              return <div key={index}>
                    <DialogContentText>
                      {user.first_name} {user.last_name} <span></span>
                      <Button size="small" variant="contained" color="success" onClick={() => assignUser(user.uid)} >Assign</Button>
                    </DialogContentText>
                    <br></br>
                </div>
            })}
          </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default Conference;