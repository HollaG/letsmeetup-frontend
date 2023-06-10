import { FacebookAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

import "firebase/compat/auth";
import fire, { auth } from "..";

const facebookAuthProvider = new FacebookAuthProvider();

export const signInWithFacebook = () =>
    signInWithPopup(auth, facebookAuthProvider);
