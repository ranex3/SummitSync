import '../App.css';
import React from 'react';
import { auth, db } from "../firebase";
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore"
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
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function Schedule() {
  const navigate = useNavigate();
  const { cid } = useParams();
  const [accountType, setAccountType] = React.useState('');
  const [currEvent, setCurrEvent] = React.useState('');
  const [authorList, setAuthorList] = React.useState([]);
  const [startDate, setStartDate] = React.useState(dayjs());
  const [endDate, setEndDate] = React.useState(dayjs());
  const [eventName, setEventName] = React.useState('');
  const [eventDesc, setEventDesc] = React.useState('');
  const [eventList, setEventList] = React.useState([]);
  const [authorName, setAuthorName] = React.useState('');

  // dialog status variable
  const [eventOpen, setEventOpen] = React.useState(false);
  const [authorsOpen, setAuthorsOpen] = React.useState(false);
  const [addAuthorOpen, setAddAuthorOpen] = React.useState(false);
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

  // view assignees dialog handlers
  const handleEventOpen = () => {
    setEventOpen(true);
  };

  const handleEventClose = (eventTrue) => {
    if (eventTrue === true) {
      addEvent();
    }

    setEventOpen(false);
  };

  // view authors dialog handlers
  const handleAuthorsOpen = (eventId) => {
    // set current event
    setCurrEvent(eventId);

    setAuthorsOpen(true);
  };

  const handleAuthorsClose = () => {
    setAuthorsOpen(false);
  };

  // add author dialog handlers
  const handleAddAuthorOpen = (eventId) => {
    // set current event
    setCurrEvent(eventId);

    setAddAuthorOpen(true);
  };

  const handleAddAuthorClose = (add) => {
    if (add === true) {
      addAuthor();
    }

    setAddAuthorOpen(false);
  };

  // add event to schedule
  async function addEvent() {
    const user = auth.currentUser;
    const token = await getIdToken(user);

    // add event
    await fetch(`http://localhost:8001/schedule/event_add?cid=${cid}&event_name=${eventName}&date_time_start=${startDate.format('DD/MM/YYYY H:m:s')}&date_time_end=${endDate.format('DD/MM/YYYY H:m:s')}&description=${eventDesc}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // update event list
    const response = await fetch(`http://localhost:8001/schedule/event_get_all?cid=${cid}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setEventList(data);
  }

  // add author to an event
  async function addAuthor() {
    const user = auth.currentUser;
    const token = await getIdToken(user);

    // add author
    console.log(currEvent)
    await fetch(`http://localhost:8001/schedule/event_author_add?cid=${cid}&eid=${currEvent}&name=${authorName}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // update author list for event
    const response = await fetch(`http://localhost:8001/schedule/event_get?cid=${cid}&eid=${currEvent}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setAuthorList(data.authors);
  }

  // delete event from schedule
  async function deleteEvent(eventId) {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/schedule/event_remove?cid=${cid}&eid=${eventId}`, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to delete event. Status:', response.status);
    } else {
      // update eventList
      const res = await fetch(`http://localhost:8001/schedule/event_get_all?cid=${cid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setEventList(data);
    }
  }

  // get all events in conference schedule when page renders
  React.useEffect(() => {
    async function getEvents() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch(`http://localhost:8001/schedule/event_get_all?cid=${cid}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.error('Failed to get schedule. Status:', response.status);
          }

          const data = await response.json();
          setEventList(data);
        }
      })
    }

    getEvents();
  }, [cid]);

  // get all authors of current event
  React.useEffect(() => {
    async function getAuthors() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch(`http://localhost:8001/schedule/event_get?cid=${cid}&eid=${currEvent}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.error('Failed to get authors. Status:', response.status);
          }

          const data = await response.json();
          setAuthorList(data.authors);
        }
      })
    }

    if (currEvent !== '') {
      getAuthors();
    }
  }, [currEvent, cid]);

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
          <h2>Schedule</h2>
          {accountType === 'organiser' ? <Button variant="contained" size="small" onClick={handleEventOpen} >Add Event</Button> : null}
          <br></br>
          <br></br>
          {eventList?.map((confEvent, index) => {
            return (
              <div key={index} >
                <Card sx={{ minWidth: 800, border: '1px solid' }} variant="outlined" >
                  <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      Starts at: {confEvent.date_time_start}, Finishes at: {confEvent.date_time_end}
                    </Typography>

                    <Typography variant="h5">
                      {confEvent.event_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {confEvent.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleAuthorsOpen(confEvent.eid)}>View authors</Button>
                    {accountType === 'organiser' ? <Button size="small" onClick={() => handleAddAuthorOpen(confEvent.eid)}>Add author</Button> : null}
                    {accountType === 'organiser' ? <Button size="small" onClick={() => deleteEvent(confEvent.eid)}>Delete Event</Button> : null}
                  </CardActions>
                </Card>
                <br></br>
              </div>
            );
          })}
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Dialog open={eventOpen} >
            <DialogTitle>Add Event</DialogTitle>
            <DialogContent>
                  <DialogContentText>
                      Add a new event to the conference schedule
                  </DialogContentText>
                  <TextField
                      autoFocus
                      margin="dense"
                      label="Event Name"
                      fullWidth
                      variant="standard"
                      value={eventName}
                      onChange={(e) => setEventName(String(e.target.value))}
                  />
                  <TextField
                      autoFocus
                      margin="dense"
                      label="Description"
                      fullWidth
                      variant="standard"
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
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
                  <Button onClick={() => handleEventClose(false)}>Cancel</Button>
                  <Button onClick={() => handleEventClose(true)}>Add Event</Button>
              </DialogActions>
        </Dialog>
      </LocalizationProvider>

      <Dialog open={authorsOpen} fullWidth={true} maxWidth={'xs'} onClose={() => handleAuthorsClose()} >
          <DialogTitle>Authors</DialogTitle>
          <DialogContent>
              {authorList?.map((author, index) => {
                return <div key={index}>
                      <DialogContentText>{author}</DialogContentText>
                  </div>
              })}
          </DialogContent>
      </Dialog>

      <Dialog open={addAuthorOpen} >
          <DialogTitle>Add Author</DialogTitle>
          <DialogContent>
              <DialogContentText>
                  Add an author to selected event
              </DialogContentText>
              <TextField
                  autoFocus
                  margin="dense"
                  label="Name"
                  fullWidth
                  variant="standard"
                  value={authorName}
                  onChange={(e) => setAuthorName(String(e.target.value))}
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={() => handleAddAuthorClose(false)}>Cancel</Button>
              <Button onClick={() => handleAddAuthorClose(true)}>Add Author</Button>
          </DialogActions>
      </Dialog>
      </div>
    </div>
  );
};

export default Schedule;