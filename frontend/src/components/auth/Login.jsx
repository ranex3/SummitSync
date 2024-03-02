import '../../App.css';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000)
      })
      .catch((error) => {
        alert("Please enter a correct username and password")
        console.log(error);
      });
  }

  return (
    <div className="App">
      <h1>Login</h1>
      <form>
        <TextField id="login-email" label="Email" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br></br>
        <TextField id="login-password" label="Password" variant="outlined" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br></br>
        <Button variant="contained" onClick={login}>Login</Button>
      </form>
      <p>Don't have an account? <Button variant="text" onClick={() => {navigate('/register')}}>Sign Up!</Button></p>
      <p>Forgot password? <Button variant="text" onClick={() => {navigate('/reset')}}>Reset Password</Button></p>
    </div>

  );
  }

export default Login;