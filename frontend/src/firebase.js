// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "KEY GOES HERE",
  authDomain: "summitsync-1395c.firebaseapp.com",
  projectId: "summitsync-1395c",
  storageBucket: "summitsync-1395c.appspot.com",
  messagingSenderId: "1002790870462",
  appId: "1:1002790870462:web:0f940969ceafcfd4662def",
  measurementId: "G-VD5V26STTD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);