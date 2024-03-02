import '../App.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase";
import HeaderBar from './HeaderBar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

function Dashboard() {
  const navigate = useNavigate();
  const [currUser, setCurrUser] = React.useState(null)
  const [conferences, setConferences] = React.useState([]);
  const [allConferences, setAllConferences] = React.useState([])
  const [radius, setRadius] = React.useState(50);
  const [showNearby, setShowNearby] = React.useState(false)

  const handleSliderChange = (e) => {
    const newRadius = e.target.value;
    setRadius(newRadius)
  }

  const handleFilterClick = () => {
    setShowNearby(true);
    nearby_conf();
  }

  const handleFilterReset = () => {
    setShowNearby(false);
    conference_list_all();
  }

  React.useEffect(() => {
    const currUserInfo = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login')
        setCurrUser(null);
      }
      else {
				const fetchAdditionalData = async () => {
					const userRef = doc(db, "users", user.uid);
					const userDoc = await getDoc(userRef);

					if (userDoc.exists()) {
						const userData = userDoc.data();
						setCurrUser(prev => ({
							...prev,
							...userData
						}));
					} else {
						console.log("No additional data for this user in database");
					}
				}
        setCurrUser(user);
				fetchAdditionalData();
      }
    });

    return () => {
      currUserInfo();
    };
  }, [navigate]);

  React.useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      getIdToken(user).then((token) => {
        console.log(token);
      });
    }
  }, []);

  React.useEffect(() => {
    conference_list_all();
  }, []);

  // nearby conference based on the distance
  async function nearby_conf() {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/conference/nearby?radius=${radius}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer: ${token}`,
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch nearby conferences. Status', response.status);
      return;
    }
    const data = await response.json();
    setConferences(data.conferences)
  }

  // get all the conferences
  async function conference_list_all() {
    const response = await fetch('http://localhost:8001/conference/list/all', {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      console.error('Failed to fetch conferences. Status:', response.status);
      return;
    }

    const data = await response.json();
    setAllConferences(data.conferences);
  }

  // join conference
  async function join_conference(cid) {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    const response = await fetch(`http://localhost:8001/conference/join?cid=${cid}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch conference_join. Status:', response.status);
      return;
    }

    if (showNearby) {
      nearby_conf();
    } else {
      conference_list_all();
    }

  }

  return (
    <div>
      <HeaderBar />
      <p className="page-name">This is the Dashboard</p>
      <div className="App">
        <label className='filter-label'>Filter by distance (km): </label>
        <input type="range" className='filter-slider' min="0" max="100" value={radius} onChange={handleSliderChange} />
        <span className='filter-value'>{radius} km</span>
        <div className='filter-buttons'>
          <Button variant="contained" color="primary" onClick={handleFilterClick}>
            Filter by Distance
          </Button>
          <Button variant="contained" color="primary" onClick={handleFilterReset}>
            Reset
          </Button>
        </div>
      </div>
      <br />
      <div className="cardContainer page-name">
        {
          (showNearby ? conferences : allConferences).map((conference, index) => {
            const currentUserUid = auth.currentUser?.uid;
            const hasJoined = currentUserUid && (
              conference.volunteers.includes(currentUserUid) ||
              conference.organiser === currentUserUid
            );

            const pending = currentUserUid && (
              conference.volunteers_request_join.includes(currentUserUid)
            )

            return (
              <Card key={index} variant='outlined' className='cardStyle'>
                <CardContent>
                  {conference.name}<br></br>
                  {
                    hasJoined ?
                    (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate(`/conference/${conference.cid}`)}
                      >
                        Details
                      </Button>
                    ) : pending ?
                    (
                      <Button
                        variant="contained"
                        disabled
                      >
                        Pending approval
                      </Button>
                    ) :
                    (
                      currUser && currUser.account_type !== 'organiser' && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => join_conference(conference.cid)}
                        >
                          Join Conference
                        </Button>
                      )
                    )
                  }
                </CardContent>
              </Card>
            );
          })
        }
      </div>
    </div>
  );
}
export default Dashboard;
