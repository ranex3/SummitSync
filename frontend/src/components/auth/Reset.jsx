import '../../App.css';
import React from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from "../../firebase";

function Reset() {
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        const emailVal = e.target.email.value;
        sendPasswordResetEmail(auth, emailVal)
            .then(() => {
                alert("Check your email for the password reset link.");
            })
            .catch(err => {
                alert("An error occurred: " + err.message);
            });
    }

    function goBackToLogin() {
        navigate('/login');
    }

    return (
        <div className="App">
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email: 
                    <input type="email" name="email" placeholder="Enter your email" />
                </label>
                <br /><br /><Button type="submit" variant="contained" color="primary">Reset</Button>
                <Button type="button" onClick={goBackToLogin} variant="outlined">Go Back to Login</Button>
            </form>
        </div>
    );
}

export default Reset;
