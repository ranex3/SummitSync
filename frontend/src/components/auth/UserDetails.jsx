import '../../App.css';
import React, { useEffect, useState } from 'react';
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

function UserDetails() {
  const [currUser, setCurrUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currUserInfo = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrUser(user);
      } else {
        setCurrUser(null);
      }
    })

    return () => {
      currUserInfo();
    }
  }, [])

  const userLogout = () => {
    signOut(auth)
      .then(() => {
      console.log('Sign out successful');
      navigate('/login');
    }).catch(error => console.log(error))
  }

  const myProfile = () => {
    navigate('/myProfile')
  }

  const toDashboard = () => {
    navigate('/dashboard')
  }

  const toConference = () => {
    navigate(`/conferenceList/${currUser.uid}`)
  }

  return (
    <div>
      {currUser ? 
        <p>
          <Button variant="text" color="inherit" onClick={toDashboard}>Dashboard</Button>
          <Button variant="text" color="inherit" onClick={toConference}>Conferences</Button>
          <Button variant="text" color="inherit" onClick={myProfile}>My Profile</Button>
          <Button variant="text" color="inherit" onClick={userLogout}>Logout</Button>
        </p> : <p>Signed out</p>}
    </div>
  );
};

export default UserDetails;