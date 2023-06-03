// https://stackoverflow.com/questions/71492939/uncaught-error-cannot-find-module-firebase

// import firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// config value from add firebase sdk script that showed earlier.
const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "meetup-8903c.firebaseapp.com",
    projectId: "meetup-8903c",
    storageBucket: "meetup-8903c.appspot.com",
    messagingSenderId: "316721016041",
    appId: process.env.REACT_APP_FIREBASE_APPID,
    measurementId: "G-41KSDTV1L5",
};

// init app
const fire = initializeApp(config);
export const db = getFirestore(fire);

// export default firestore
export default fire;
