import '../App.css';
import React from 'react';
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase";
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Button from '@mui/material/Button';
import { Unstable_NumberInput as NumberInput, numberInputClasses } from '@mui/base/Unstable_NumberInput';
import { styled } from '@mui/system';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// styling for NumberInput:
const blue = {
  100: '#DAECFF',
  200: '#80BFFF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const StyledInputRoot = styled('div')(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-weight: 400;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  display: grid;
  grid-template-columns: 1fr 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  column-gap: 8px;
  padding: 4px;

  &.${numberInputClasses.focused} {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
  }

  &:hover {
    border-color: ${blue[400]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledInputElement = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  grid-column: 1/2;
  grid-row: 1/3;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 8px 12px;
  outline: 0;
`,
);

const StyledButton = styled('button')(
  ({ theme }) => `
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  appearance: none;
  padding: 0;
  width: 19px;
  height: 19px;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  box-sizing: border-box;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 0;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    cursor: pointer;
  }

  &.${numberInputClasses.incrementButton} {
    grid-column: 2/3;
    grid-row: 1/2;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: 1px solid;
    border-bottom: 0;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }

  &.${numberInputClasses.decrementButton} {
    grid-column: 2/3;
    grid-row: 2/3;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }
  & .arrow {
    transform: translateY(-1px);
  }
`,
);

function LogAttendance() {
  const navigate = useNavigate();
  const { cid } = useParams();
  const [accountType, setAccountType] = React.useState('');
  const [date, setDate] = React.useState(dayjs());
  const [hours, setHours] = React.useState(0);
  const [desc, setDesc] = React.useState('');
  const [confName, setConfName] = React.useState('')

  // form dialog status variables
  const [successOpen, setSucessOpen] = React.useState(false);

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

  // submit attendance form
  async function submitForm() {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/attendance/log_attendance?cid=${cid}&description=${desc}&date=${date.format('DD/MM/YYYY H:m:s')}&hours=${hours}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to submit attendance form. Status', response.status);
      return;
    } else {
      setSucessOpen(true);
    }

    const data = await response.json();
    console.log(data);
  }

  // get user account type
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
          <h2>Log Attendance</h2>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              format="DD/MM/YYYY"
            />
          </LocalizationProvider>

          <br></br>
          <br></br>

          <NumberInput
            slots={{
              root: StyledInputRoot,
              input: StyledInputElement,
              incrementButton: StyledButton,
              decrementButton: StyledButton,
            }}
            slotProps={{
              incrementButton: {
                children: '▴',
              },
              decrementButton: {
                children: '▾',
              },
            }}
            label="Hours"
            placeholder="Enter hours worked here"
            onChange={(event, val) => setHours(val)}
          />

          <br></br>

          <TextField
              margin="dense"
              label="Description"
              fullWidth
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
          />

          <br></br>
          <br></br>

          <Button variant="contained" onClick={() => submitForm()}>Submit</Button>
        </div>

        <Dialog open={successOpen} >
            <DialogTitle>Attendance submitted successfully!</DialogTitle>
            <DialogActions>
                <Button onClick={() => setSucessOpen(false)}>Ok</Button>
            </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default LogAttendance;