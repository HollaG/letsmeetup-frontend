// https://stackoverflow.com/questions/71492939/uncaught-error-cannot-find-module-firebase

// import firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// config value from add firebase sdk script that showed earlier.
const config = {
    apiKey: "AIzaSyBn4odTF2aQdfwrORAOhmFpUpsf6-aF7x0",
    authDomain: "meetup-8903c.firebaseapp.com",
    projectId: "meetup-8903c",
    storageBucket: "meetup-8903c.appspot.com",
    messagingSenderId: "316721016041",
    appId: "1:316721016041:web:0cfea0c6ffb2beefd91478",
    measurementId: "G-41KSDTV1L5"
};

// init app
const fire = initializeApp(config);

// export default firestore
export default fire;
