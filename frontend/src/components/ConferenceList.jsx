import React from 'react';
import '../App.css';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase";
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import HeaderBar from './HeaderBar';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function ConferenceList () {
	const navigate = useNavigate();
	const { uid } = useParams()
	const [currUser, setCurrUser] = React.useState(null)
    const [open, setOpen] = React.useState(false);
	const [confDetails, setConfDetails] = React.useState([])
	const [confName, setConfName] = React.useState('');
	const [location, setLocation] = React.useState('');
	const [city, setCity] = React.useState('')
	const [country, setCountry] = React.useState('');

	const formattedlocation = `${location}, ${city}, ${country}`

    //form dialog handlers
    const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClickClose = (create) => {
		if (create === true) {
			createConference();
		}

        setOpen(false);
	};

	// create a conference
	async function createConference () {
		const user = auth.currentUser;
		const token = await getIdToken(user);
		await fetch(`http://localhost:8001/conference/create?name=${confName}&location=${formattedlocation}`, {
			method: 'POST',
			mode: 'cors',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		// update conference details
		onAuthStateChanged(auth, async (user) => {
			if (user) {
				const token = await getIdToken(user);
				const response = await fetch(`http://localhost:8001/conference/list?uid=${uid}`, {
					method: 'GET',
					mode: 'cors',
					headers: {
						'Authorization': `Bearer ${token}`
					}
				})

				if (!response.ok) {
					console.error('Failed to fetch conferences. Status:', response.status);
					return;
				}

				const data = await response.json();
				setConfDetails(data.conferences);
			}
		})

		// update current user info
		onAuthStateChanged(auth, (user) => {
			if (!user) {
				navigate('/login');
				setCurrUser(null);
			}
			else {
				setCurrUser(user);

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
				fetchAdditionalData();
			}
		});
	}

	// get conference details which user joined
	React.useEffect(() => {
		async function getConfDetails () {
			onAuthStateChanged(auth, async (user) => {
				if (user) {
					const token = await getIdToken(user);
					const response = await fetch(`http://localhost:8001/conference/list`, {
						method: 'GET',
						mode: 'cors',
						headers: {
							'Authorization': `Bearer ${token}`
						}
					})

					if (!response.ok) {
						console.error('Failed to fetch conferences. Status:', response.status);
						return;
					}

					const data = await response.json();
					setConfDetails(data.conferences);
				}
			})
		}
		getConfDetails();
	}, [uid]);

	function goToConference (cid) {
		navigate(`/conference/${cid}`);
	}

    // Check if the user is not authenticated, and if so, navigate to the login page
	React.useEffect(() => {
		const currUserInfo = onAuthStateChanged(auth, (user) => {
			if (!user) {
				navigate('/login');
				setCurrUser(null);
			}
			else {
				setCurrUser(user);

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
				fetchAdditionalData();
			}
		});

		return () => {
			currUserInfo();
		};
	}, [navigate]);

	function renderConferences() {
		if (confDetails.length === 0) {
			return <div>No conference you have joined</div>
		}

		return confDetails.map((conf, index) => (
			<Card key={index} variant='outlined' className='cardStyle'>
				<CardContent>
					uid: {currUser ? currUser.email_address : 'Logged out'}<br></br>
					Conference Name: {conf.name}<br></br>
					<Button onClick={() => goToConference(conf.cid)}>Details</Button>
				</CardContent>
			</Card>
		));
	}

	return (
		<div>
			<HeaderBar />
			<div className='page-name'>
				Conferences
			</div>
            <br></br><br></br>

			{ // decide whether to show 'create conference' button or not
				currUser ? (
					currUser.account_type === "organiser" && currUser.joined_conferences.length === 0 ?
						<Button variant="outlined" onClick={handleClickOpen}>
							Create Conference
						</Button>
					: null
					)
				: null
			}

            <br></br><br></br>
            <Dialog open={open} onClose={handleClickClose}>
                <DialogTitle>Create Conference</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To create your own conference, please enter the following information:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Conference Name"
                        fullWidth
                        variant="standard"
						onChange={(e) => setConfName(e.target.value)}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="street name"
                        fullWidth
                        variant="standard"
						onChange={(e) => setLocation(e.target.value)}
                    />
					<TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="city"
                        fullWidth
                        variant="standard"
						onChange={(e) => setCity(e.target.value)}
                    />
					<TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Country"
                        fullWidth
                        variant="standard"
						onChange={(e) => setCountry(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClickClose(false)}>Cancel</Button>
                    <Button onClick={() => handleClickClose(true)}>Create</Button>
                </DialogActions>
            </Dialog>
            <div className="cardContainer page-name">
                {renderConferences()}
            </div>

		</div>

	)
};

export default ConferenceList