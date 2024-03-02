import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LandscapeRoundedIcon from '@mui/icons-material/LandscapeRounded';
import { useNavigate } from 'react-router-dom';
import UserDetails from './auth/UserDetails';
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from 'firebase/auth';

function HeaderBar() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = React.useState('');

  // get user's account type
  React.useEffect(() => {
    const currUserInfo = onAuthStateChanged(auth, (user) => {
      if (user) {
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => {navigate('/dashboard')}}
          >
            <LandscapeRoundedIcon style={{ fontSize: 60 }} />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SummitSync: {accountType + ' suite'}
          </Typography>
          <UserDetails/>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default HeaderBar;