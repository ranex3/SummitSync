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
import Rating from '@mui/material/Rating';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

function Attendance() {
  const navigate = useNavigate();
  const { cid, uid } = useParams();
  const [accountType, setAccountType] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [userRating, setUserRating] = React.useState(0);
  const [rating, setRating] = React.useState(0);
  const [feedback, setFeedback] = React.useState('');
  const [attendances, setAttendances] = React.useState([]);
  const [confName, setConfName] = React.useState('')

  // form dialog status variables
  const [rateOpen, setRateOpen] = React.useState(false);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

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

  // rate dialog handlers
  const handleRateOpen = () => {
    setRateOpen(true);
  };

  const handleRateClose = (submit) => {
    if (submit === true) {
      rateUser();
    }

    setRateOpen(false);
  };

  // feedback dialog handlers
  const handleFeedbackOpen = () => {
    setFeedbackOpen(true);
  };

  const handleFeedbackClose = (submit) => {
    if (submit === true) {
      giveFeedback();
    }

    setFeedbackOpen(false);
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

  // rate user
  async function rateUser() {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/attendance/rate_volunteer?cid=${cid}&uid=${uid}&score=${rating}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to rate user. Status:', response.status);
    } else {
      // update userRating
      const res = await fetch(`http://localhost:8001/attendance/get_averaged_rating?uid=${uid}`, {
        method: 'GET',
        mode: 'cors',
      });

      if (!res.ok) {
        console.error('Failed to get user rating. Status:', response.status);
      }

      const data = await res.json();
      setUserRating(data.averaged_score);
    }
  }

  // give feedback to user
  async function giveFeedback() {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/attendance/fill_in_feedback?cid=${cid}&uid=${uid}&feedback=${feedback}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to give feedback. Status:', response.status);
    }
  }

  // approve attendance request
  async function approveAttendance(attendanceId) {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/attendance/approve_attendance?cid=${cid}&aid=${attendanceId}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to approve attendance. Status:', response.status);
    } else {
      // update attendances
      const res = await fetch(`http://localhost:8001/attendance/get_all_user_attendances?cid=${cid}&uid=${uid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAttendances(data.attendances)
    }
  }

  // decline attendance request
  async function declineAttendance(attendanceId) {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/attendance/delete_attendance?cid=${cid}&aid=${attendanceId}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to decline attendance. Status:', response.status);
    } else {
      // update attendances
      const res = await fetch(`http://localhost:8001/attendance/get_all_user_attendances?cid=${cid}&uid=${uid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAttendances(data.attendances)
    }
  }

  // get user's info, and all of their attendance info
  React.useEffect(() => {

    // get user's name
    async function getUserName() {
      const response = await fetch(`http://localhost:8001/user/get_profile?uid=${uid}`, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        console.error('Failed to get user info. Status:', response.status);
      }

      const data = await response.json();
      setUserName(data.user.first_name + ' ' + data.user.last_name);
    }

    // get user's attendance requests
    async function getAttendances() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch(`http://localhost:8001/attendance/get_all_user_attendances?cid=${cid}&uid=${uid}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.error('Failed to get user\'s attendance. Status:', response.status);
          }

          const data = await response.json();
          setAttendances(data.attendances)
        }
      })
    }

    getUserName()
    getAttendances()
  }, [cid, uid]);

  // get user's average rating
  React.useEffect(() => {
    async function getUserRating() {
      const response = await fetch(`http://localhost:8001/attendance/get_averaged_rating?uid=${uid}`, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        console.error('Failed to get user\'s rating. Status:', response.status);
      }

      const data = await response.json();
      setUserRating(data.averaged_score);
    }

    getUserRating()
  }, [uid]);

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
          </Menu>
        </Sidebar>
        <div className='conf-page'>
          <h2>{userName}'s Attendance</h2>
          <Typography variant="h6">Averaged User Rating</Typography>
          <Rating value={userRating} precision={0.1} readOnly /> <br></br>
          <Button variant="contained" size="small" onClick={() => handleRateOpen()} >Add Rating</Button>
          <Button variant="contained" size="small" color="success" onClick={() => handleFeedbackOpen()} >Give Feedback</Button>
          <br></br>
          <br></br>
          <Typography variant="h6">Attendance Requests</Typography>
          {attendances?.map((attendance, index) => {
            return (
              <div key={index} >
                <Card sx={{ minWidth: 800, border: '1px solid' }} variant="outlined" >
                  <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      {attendance.date}
                    </Typography>
                    <Typography variant="h5">
                      Hours worked: {attendance.hours_worked}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {attendance.description}
                    </Typography>
                    <br></br>
                    {attendance.status === 'pending' ? <Typography variant="body2" color="warning.main"> {attendance.status} </Typography>
                    : <Typography variant="body2" color="success.main"> {attendance.status} </Typography>}
                  </CardContent>
                  <CardActions>
                    {(attendance.status === 'pending' && accountType === 'organiser') ? <Button size="small" color="success" onClick={() => approveAttendance(attendance.aid)} >Approve</Button> : null}
                    {(attendance.status === 'pending' && accountType === 'organiser') ? <Button size="small" color="error" onClick={() => declineAttendance(attendance.aid)}>Decline</Button> : null}
                  </CardActions>
                </Card>
                <br></br>
              </div>
            );
          })}
        </div>
        <Dialog open={rateOpen} >
            <DialogTitle>Rate {userName}'s performance</DialogTitle>
            <DialogContent>
              <Rating
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue);
                }}
              />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleRateClose(false)}>Cancel</Button>
                <Button onClick={() => handleRateClose(true)}>Submit</Button>
            </DialogActions>
        </Dialog>

        <Dialog open={feedbackOpen} >
            <DialogTitle>Give feedback to {userName}</DialogTitle>
            <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label="Feedback"
                fullWidth
                variant="standard"
                value={feedback}
                onChange={(e) => setFeedback(String(e.target.value))}
              />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleFeedbackClose(false)}>Cancel</Button>
                <Button onClick={() => handleFeedbackClose(true)}>Submit</Button>
            </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Attendance;