import './App.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from "./firebase";
import Login from './components/auth/Login';
import Reset from './components/auth/Reset';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import MyProfile from './components/MyProfile';
import Conference from './components/Conference';
import ConferenceList from './components/ConferenceList';
import Applications from './components/Applications';
import Volunteers from './components/Volunteers';
import Forum from './components/Forum';
import Posts from './components/Posts';
import MyTasks from './components/MyTasks';
import Schedule from './components/Schedule';
import LogAttendance from './components/LogAttendance';
import ViewAttendance from './components/ViewAttendance';
import Attendance from './components/Attendance';
import MyFeedback from './components/MyFeedBack';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/reset" element={<Reset/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/myProfile" element={<MyProfile/>} />
        <Route path="/conference" element={<Conference/>} />
        <Route path="/conference/:cid" element={<Conference/>} />
        <Route path="/conference/:cid/applications" element={<Applications/>} />
        <Route path="/conference/:cid/volunteers" element={<Volunteers/>} />
        <Route path="/conference/:cid/forum" element={<Forum/>} />
        <Route path="/conference/:cid/forum/:fid/:forumTitle/posts" element={<Posts/>} />
        <Route path="/conference/:cid/myTasks" element={<MyTasks/>} />
        <Route path="/conference/:cid/schedule" element={<Schedule/>} />
        <Route path="/conference/:cid/logAttendance" element={<LogAttendance/>} />
        <Route path="/conference/:cid/viewAttendance" element={<ViewAttendance/>} />
        <Route path="/conference/:cid/viewAttendance/:uid/attendance" element={<Attendance/>} />
        <Route path="/conference/:cid/myFeedback" element={<MyFeedback/>} />
        <Route path="/conferenceList/:uid" element={<ConferenceList/>} />
       </Routes>
    </Router>
  );
}

function Home () {
  const navigate = useNavigate();

  React.useEffect(() => {
    const currUserInfo = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    })

    return () => {
      currUserInfo();
    }
  }, [navigate])

  return <div>Home</div>;
}


export default App;
