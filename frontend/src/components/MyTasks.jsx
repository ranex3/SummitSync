import '../App.css';
import React from 'react';
import { auth, db } from "../firebase";
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function MyTasks() {
  const navigate = useNavigate();
  const { cid } = useParams();
  const [accountType, setAccountType] = React.useState('');
  const [taskList, setTaskList] = React.useState([]);
  const [currTid, setCurrTid] = React.useState('');
  const [assigneeList, setAssigneeList] = React.useState([]);
  const [confName, setConfName] = React.useState('')

  // dialog status variable
  const [assigneesOpen, setAssigneesOpen] = React.useState(false);

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
    navigate(`/conference/${cid}/myTasks`);
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

  // sign up for task
  async function leaveTask(tid) {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/task/unsign_up_task?cid=${cid}&tid=${tid}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to leave task. Status:', response.status);
    } else {
      // update taskList
      const res = await fetch(`http://localhost:8001/task/get_all_user_tasks?cid=${cid}`, {
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

  // get all tasks that current user is signed up for when page renders
  React.useEffect(() => {
    async function getTasks() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch(`http://localhost:8001/task/get_all_user_tasks?cid=${cid}`, {
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

  // get all assignees of current task
  React.useEffect(() => {
    async function getAssignees() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
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
          <h2>My Tasks</h2>
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
                    <Button size="small" onClick={() => leaveTask(task.tid)} >Leave Task</Button>
                    <Button size="small" onClick={() => handleAssigneesOpen(task.tid)}>View Assignees</Button>
                  </CardActions>
                </Card>
                <br></br>
              </div>
            );
          })}
        </div>
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
      </div>
    </div>
  );
};

export default MyTasks;