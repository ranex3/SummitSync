import '../App.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, getIdToken, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase";
import HeaderBar from './HeaderBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';

function MyProfile() {
    const navigate = useNavigate();
    const [currUser, setCurrUser] = React.useState(null)
    const [password, setPassword] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [gender, setGender] = React.useState('');
    const [skills, setSkills] = React.useState([]);
    const [availability, setAvailability] = React.useState([]);
    const [preferences, setPreferences] = React.useState([])
    const avaialbeSkills = ["Communication", "Leadership", "Critical-Thinking", "Management"]
    const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const availablePreferences = ["technology", "education", "hospitality", "customer service"]

    // form dialog status variables
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [editInfoOpen, setEditInfoOpen] = React.useState(false);
    const [editSkillsOpen, setSkillsOpen] = React.useState(false);
    const [editPreferencesOpen, setEditPreferencesOpen] = React.useState(false);
    const [editAvailabilityOpen, setEditAvailabilityOpen] = React.useState(false);

    // form dialog handlers - account deletion
    const handleDeleteOpen = () => {
        // reset password variable
        setPassword('');

		setDeleteOpen(true);
	};

	const handleDeleteClose = (removeUser) => {
		if (removeUser === true) {
            deleteAccount();
		}

        setDeleteOpen(false);
	};

    // form dialog handlers - editing personal info
    const handleEditInfoOpen = () => {
        // reset firstname, lastname, & gender variables
        setFirstName('');
        setLastName('');
        setGender('');

		setEditInfoOpen(true);
	};

    const handleEditInfoClose = (confirm) => {
        if (confirm === true) {
            editPersonalInfo();
        }
		setEditInfoOpen(false);
	};

    const handleEditSkillsOpen = () => {
        setSkills(currUser && currUser.skills ? currUser.skills : []);
        setSkillsOpen(true);
    };

    const handleEditSkillsClose = (confirm) => {
        if (confirm === true) {
            editSkills();
        }
        setSkillsOpen(false)
    }

    const handleSkillChange = (event) => {
        const {
            target: { value },
        } = event;
        setSkills(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleEditAvailabilityOpen = () => {
        setAvailability(currUser && currUser.availability ? currUser.availability : []);
        setEditAvailabilityOpen(true);
    };
    
    const handleEditAvailabilityClose = (confirm) => {
        if (confirm === true) {
            editAvailability();
        }
        setEditAvailabilityOpen(false);
    }

    const handleAvailabilityChange = (event) => {
        const {
            target: { value },
        } = event;
        setAvailability(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleEditPreferenceOpen = () => {
        setPreferences(currUser && currUser.research_interests ? currUser.research_interests : []);
        setEditPreferencesOpen(true);
    };
    
    const handleEditPreferenceClose = (confirm) => {
        if (confirm === true) {
            editPreferences();
        }
        setEditPreferencesOpen(false);
    }

    const handlePreferenceChange = (event) => {
        const {
            target: { value },
        } = event;
        setPreferences(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    // edit user's personal info (name and gender)
    async function editPersonalInfo() {
        const user = auth.currentUser;
        const uid = user.uid;
        const token = await getIdToken(user);

        await fetch(`http://localhost:8001/user/edit_profile?uid=${uid}&f_name=${firstName}&l_name=${lastName}&gender=${gender}`, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(() => {
            fetchUserInfo()
        }).catch((error) => {
            console.log(error);
        })
    }

    // fetch user's information from firebase database
    async function fetchUserInfo() {
        const user = auth.currentUser;
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

    // edit skills
    async function editSkills() {
        const user = auth.currentUser;
        const uid = user.uid;
        const token = await getIdToken(user);

        await fetch(`http://localhost:8001/user/edit_profile?uid=${uid}&skills=${skills}`, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(() => {
            fetchUserInfo()
        }).catch((error) => {
            console.log(error)
        })
    }

    // edit availability
    async function editAvailability() {
        const user = auth.currentUser;
        const uid = user.uid;
        const token = await getIdToken(user);
    
        await fetch(`http://localhost:8001/user/edit_profile?uid=${uid}&availability=${availability}`, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(() => {
            fetchUserInfo()
        }).catch((error) => {
            console.log(error)
        })
    }

    // edit preferences
    async function editPreferences() {
        const user = auth.currentUser;
        const uid = user.uid;
        const token = await getIdToken(user);
    
        await fetch(`http://localhost:8001/user/edit_profile?uid=${uid}&research_interest=${preferences}`, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(() => {
            fetchUserInfo()
        }).catch((error) => {
            console.log(error)
        })
    }

    // delete current user
    function deleteAccount () {
		const user = auth.currentUser;
        const uid = user.uid;

        const credential = EmailAuthProvider.credential(
            user.email,
            password
        )

        reauthenticateWithCredential(user, credential).then(async () => {
            // delete user from database
            await fetch(`http://localhost:8001/auth/delete?uid=${uid}`, {
                method: 'DELETE',
                mode: 'cors',
            }).then(() => {
                // delete user auth
                deleteUser(user);
            }).catch((error) => {
                // catch error for fetch
                console.log(error);
            })
        }).catch((error) => {
            alert("Incorrect password")
            console.log(error);
        });
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

    return (
        <div>
            <HeaderBar />
            <p className="page-name">My Profile</p>
    
            <div className='delete-button' onClick={handleDeleteOpen}>
                <Button variant="contained" color="error">
                    Delete Account
                </Button>
            </div>
    
            <h2>Personal Information</h2>
            <p>email: {currUser ? currUser.email : 'Logged out'}</p>
            <p>first name: {currUser ? currUser.first_name : 'Not available'}</p>
            <p>last name: {currUser ? currUser.last_name : 'Not available'}</p>
            <p>gender: {currUser ? currUser.gender : 'Not available'}</p>
            <p>Date of birth: {currUser ? currUser.dob : 'Not available'}</p>
    
            <Button variant="contained" size="small" onClick={handleEditInfoOpen}>
                Edit Personal Info
            </Button>
    
            {/* Skills Section */}
            <section>
                <h2>Skills</h2>
                {currUser && currUser.skills ? (
                    currUser.skills.length > 0 ? (
                        <ul>
                            {currUser.skills.map((skill) => (
                                <li key={skill}>{skill}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No Skills listed.</p>
                    )
                ) : (
                    <p>Loading skills...</p>
                )}
                <br />
                <Button variant="outlined" onClick={handleEditSkillsOpen}>+ Add Skill</Button>
            </section>
    
            {/* Availability Section */}
            <section>
                <h2>Availability</h2>
                {currUser && currUser.availability ? (
                    currUser.availability.length > 0 ? (
                        <ul>
                            {currUser.availability.map((day) => (
                                <li key={day}>{day}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No availability listed.</p>
                    )
                ) : (
                    <p>Loading availability</p>
                )}
                <br />
                <Button variant="outlined" onClick={handleEditAvailabilityOpen}>Edit Availability</Button>
            </section>

            {/* Preferences Section */}
            <section>
                <h2>Preferences</h2>
                {currUser && currUser.research_interests ? (
                    currUser.research_interests.length > 0 ? (
                        <ul>
                            {currUser.research_interests.map((preference) => (
                                <li key={preference}>{preference}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No preference listed.</p>
                    )
                ) : (
                    <p>Loading preference</p>
                )}
                <br />
                <Button variant="outlined" onClick={handleEditPreferenceOpen}>Edit Preferences</Button>
            </section>
    
            {/* Delete Account Dialog */}
            <Dialog open={deleteOpen} onClose={() => handleDeleteClose(false)}>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter your password to continue:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        fullWidth
                        variant="standard"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDeleteClose(false)}>Cancel</Button>
                    <Button color="error" onClick={() => handleDeleteClose(true)}>Delete</Button>
                </DialogActions>
            </Dialog>
    
            {/* Edit Personal Info Dialog */}
            <Dialog open={editInfoOpen} onClose={() => handleEditInfoClose(false)}>
                <DialogTitle>Edit Personal Info</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter your updated details:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="First Name"
                        fullWidth
                        variant="standard"
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Last Name"
                        fullWidth
                        variant="standard"
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Gender"
                        fullWidth
                        variant="standard"
                        onChange={(e) => setGender(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleEditInfoClose(false)}>Cancel</Button>
                    <Button onClick={() => handleEditInfoClose(true)}>Confirm</Button>
                </DialogActions>
            </Dialog>
    
            {/* Edit Skills Dialog */}
            <Dialog open={editSkillsOpen} onClose={() => handleEditSkillsClose(false)}>
                <DialogTitle>Edit Skills</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select your skills:
                    </DialogContentText>
                    <Select
                        multiple
                        value={skills}
                        onChange={handleSkillChange}
                        input={<OutlinedInput id="select-multiple-chip" />}
                        renderValue={(selected) => (
                            <Box sx={{ className: "selectMultipleChipBox" }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {avaialbeSkills.map((skill) => (
                            <MenuItem key={skill} value={skill}>
                                {skill}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => handleEditSkillsClose(false)}>Cancel</Button>
                <Button onClick={() => handleEditSkillsClose(true)}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Edit availability Dialog */}
            <Dialog open={editAvailabilityOpen} onClose={() => handleEditAvailabilityClose(false)}>
                <DialogTitle>Edit Availability</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select your availability:
                    </DialogContentText>
                    <Select
                        multiple
                        value={availability}
                        onChange={handleAvailabilityChange}
                        input={<OutlinedInput id="select-multiple-chip" />}
                        renderValue={(selected) => (
                            <Box sx={{ className: "selectMultipleChipBox" }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {availableDays.map((day) => (
                            <MenuItem key={day} value={day}>
                                {day}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => handleEditAvailabilityClose(false)}>Cancel</Button>
                <Button onClick={() => handleEditAvailabilityClose(true)}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Edit preferences Dialog */}
            <Dialog open={editPreferencesOpen} onClose={() => handleEditPreferenceClose(false)}>
                <DialogTitle>Edit Preferecnes</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select your Preferences:
                    </DialogContentText>
                    <Select
                        multiple
                        value={preferences}
                        onChange={handlePreferenceChange}
                        input={<OutlinedInput id="select-multiple-chip" />}
                        renderValue={(selected) => (
                            <Box sx={{ className: "selectMultipleChipBox" }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} />
                                ))}
                            </Box>
                        )}
                    >
                        {availablePreferences.map((day) => (
                            <MenuItem key={day} value={day}>
                                {day}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleEditPreferenceClose(false)}>Cancel</Button>
                    <Button onClick={() => handleEditPreferenceClose(true)}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MyProfile;