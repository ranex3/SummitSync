import '../App.css';
import React from 'react';
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase";
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Button from '@mui/material/Button';

function Volunteers() {
  const navigate = useNavigate();
  const { cid } = useParams();
  const [accountType, setAccountType] = React.useState('');
  const [volList, setVolList] = React.useState([]);
  const [nameList, setNameList] = React.useState([]);
  const [accTypes, setAccTypes] = React.useState([]);
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

  // get all ids of users who are in conference
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
      setVolList(data.conference.volunteers);
    }
    getUserIds()

  }, [cid]);

  // get all names & account types of users who are in conference
  React.useEffect(() => {
    async function getUserNames() {
      const names = [];
      const accountTypes = [];
      for (const index in volList) {
        const response = await fetch(`http://localhost:8001/user/get_profile?uid=${volList[index]}`, {
          method: 'GET',
          mode: 'cors',
        })

        if (!response.ok ) {
          console.error('Failed to get user info. Status:', response.status);
        };

        const data = await response.json();
        names.push(data.user.first_name + ' ' + data.user.last_name)
        accountTypes.push(data.user.account_type);
      }
      setNameList(names);
      setAccTypes(accountTypes);
    }
    getUserNames()

  }, [volList, cid]);

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

  // promote volunteer to manager
  async function promoteVolunteer(userId, accTypesIndex) {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/conference/promote?cid=${cid}&uid=${userId}`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // if volunteer was successfully promoted, update accTypes variable
    if (!response.ok) {
      console.error('Failed to get conference details. Status:', response.status);
    } else {
      setAccTypes(oldList => {
        const newList = [...oldList];
        newList[accTypesIndex] = 'manager';
        return newList;
      })
    }
  }

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
          <h2>Volunteers</h2>
          {volList?.map((userId, index) => (
            <p key={index}>
              {nameList[index]} ({accTypes[index]}) <span></span>
              {accountType === 'organiser' ?
                (accTypes[index] === 'volunteer' && (
                  <Button variant="contained" color="success" onClick={() => promoteVolunteer(userId, index)}>
                    Promote
                  </Button>
                ))
              : null}
              <br></br>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Volunteers;