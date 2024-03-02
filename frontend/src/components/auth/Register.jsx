import '../../App.css';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('');
  const [accountType, setAccountType] = useState('');
  const navigate = useNavigate();

  const register = (e) => {
    e.preventDefault();

    // Convert dob to dd/mm/yyyy format
    const [year, month, day] = dob.split('-');
    const formattedDob = `${day}/${month}/${year}`;
    const formattedlocation = `${location}, ${city}, ${country}`

    createUserWithEmailAndPassword(auth, email, password)
      .then((userInfo) => {
        registerUser(userInfo.user.uid, firstName, lastName, email, accountType, gender, formattedDob, formattedlocation)
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000)

      })
      .catch((error) => {
        console.log(error);
      });
  };

  async function registerUser (uid, firstName, lastName, email, accountType, gender, dob, location) {
    await fetch(`http://localhost:8001/auth/register?uid=${uid}&f_name=${firstName}&l_name=${lastName}&email_addr=${email}&account_type=${accountType}&gender=${gender}&dob=${dob}&location=${location}`, {
      mode: 'no-cors',
      method: 'POST',
    });
  }

  return (
    <div className="App">
      <h1>Create an account</h1>
      <form>
        <TextField id="register-firstName" label="First name" variant="outlined" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <br /><br />
        <TextField id="register-lastName" label="Last name" variant="outlined" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <br /><br />
        <TextField id="register-email" label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br /><br />
        <TextField id="register-password" label="Password" variant="outlined" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br /><br />
        <TextField
          id="register-dob"
          label="Date of Birth"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          variant="outlined"
        />
        <br /><br />
        <TextField id="register-location" label="location" variant="outlined" type="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <br /><br />
        <TextField id="register-city" label="City" variant="outlined" type="city" value={city} onChange={(e) => setCity(e.target.value)} />
        <br /><br />
        <TextField id="register-country" label="Country" variant="outlined" type="country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <br /><br />
        <TextField id="register-gender" label="Gender" variant="outlined" value={gender} onChange={(e) => setGender(e.target.value)} />
        <br /><br />
        <FormControl component="fieldset">
          <FormLabel component="legend">Account Type</FormLabel>
          <RadioGroup
            aria-label="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <FormControlLabel value="volunteer" control={<Radio />} label="Volunteer" />
            <FormControlLabel value="manager" control={<Radio />} label="Volunteer Manager" />
            <FormControlLabel value="organiser" control={<Radio />} label="Organiser" />
          </RadioGroup>
        </FormControl>
        <br /><br />
        <Button variant="contained" onClick={register}>Sign in</Button>
      </form>
      <p>Already have an account?<Button variant="text" onClick={() => navigate('/login')}>Sign In!</Button></p>
    </div>
  );
}

export default Register;
