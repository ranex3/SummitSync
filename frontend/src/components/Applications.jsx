import '../App.css';
import React from 'react';
import Button from '@mui/material/Button';
import HeaderBar from './HeaderBar';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged, getIdToken } from 'firebase/auth';

function Applications () {
  const navigate = useNavigate();
  const { cid } = useParams();
  const [accountType, setAccountType] = React.useState('');
  const [appsList, setAppsList] = React.useState([]);
  const [nameList, setNameList] = React.useState([]);
  const [confName, setConfName] = React.useState('')

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

  // get all ids of users who have requested to join conference
  React.useEffect(() => {
    async function getUserIds() {
      const response = await fetch(`http://localhost:8001/conference/details?cid=${cid}`, {
        method: 'GET',
        mode: 'cors',
      });


      if (!response.ok) {
        console.error('Failed to get conference details. Status:', response.status);
      }

      const data = await response.json();
      setAppsList(data.conference.volunteers_request_join);
    }
    getUserIds()

  }, [cid]);

  // get all names of users who have requested to join conference
  React.useEffect(() => {
    async function getUserNames() {
      const names = [];
      for (const index in appsList) {
        const response = await fetch(`http://localhost:8001/user/get_profile?uid=${appsList[index]}`, {
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
    getUserNames()

  }, [appsList, cid]);

  // approve user join request
  async function approveUser(cid, uid) {
    await fetch(`http://localhost:8001/conference/approve?cid=${cid}&uid=${uid}`, {
      method: 'POST',
      mode: 'cors',
    })

    // update appsList
    const response = await fetch(`http://localhost:8001/conference/details?cid=${cid}`, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      console.error('Failed to get conference details. Status:', response.status);
    }

    const data = await response.json();
    setAppsList(data.conference.volunteers_request_join);
  }

  // Check if the user is not authenticated, and if so, navigate to the login page
  // get current user details
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
    <>
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
        <h2>Applications</h2>
        {accountType === 'organiser' ? (
          appsList?.map((userId, index) => (
            <p key={index}>
              {nameList[index]}
              <Button variant="contained" color="success" onClick={() => approveUser(cid, userId)}>
                Approve
              </Button>
              <br></br>
            </p>
          ))
        ) : (
          <p>You have no right to approve volunteers to join the conference.</p>
        )}
        </div>
      </div>

    </>
  );
}
export default Applications;