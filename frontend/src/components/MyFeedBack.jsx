import '../App.css';
import React from 'react';
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase";
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function MyFeedback() {
  const navigate = useNavigate();
  const { cid } = useParams();
  const [accountType, setAccountType] = React.useState('');
  const [confName, setConfName] = React.useState('')
  const [feedbackList, setFeedBackList] = React.useState([]);
  const [nameList, setNameList] = React.useState([]);
  const [userId, setUserId] = React.useState('');

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

  // get user's account type
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
            setUserId(userData.uid);
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

  // get all feedback for user
  React.useEffect(() => {
    async function getAllFeedback() {
      const response = await fetch(`http://localhost:8001/attendance/get_user_feedback?cid=${cid}&uid=${userId}`, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        console.error('Failed to fetch user feedback. Status', response.status);
        return;
      }

      const data = await response.json();
      setFeedBackList(data.feedback);
    }
    if (userId !== '') {
      getAllFeedback()
    }
  }, [userId, cid]);

  // get names of all accounts who gave current user feedback
  React.useEffect(() => {
    async function getNames() {
      const names = [];
      for (const index in feedbackList) {
        const response = await fetch(`http://localhost:8001/user/get_profile?uid=${feedbackList[index].sent_by}`, {
          method: 'GET',
          mode: 'cors',
        })

        if (!response.ok ) {
          console.error('Failed to get user info. Status:', response.status);
        };

        const data = await response.json();
        names.push(data.user.first_name + ' ' + data.user.last_name)
      }
      setNameList(names);
    }

    getNames();
  }, [feedbackList, cid]);

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
          <h2>My Feedback</h2>
          {feedbackList?.map((feedback, index) => {
            return (
              <div key={index} >
                <Card sx={{ minWidth: 800, border: '1px solid' }} variant="outlined" >
                  <CardContent>
                    <Typography variant="h6">
                      {feedback.feedback}
                    </Typography>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      From: {nameList[index]}
                    </Typography>
                  </CardContent>
                </Card>
                <br></br>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyFeedback;