import { FacebookAuthProvider, signInWithPopup } from "firebase/auth";

import "firebase/compat/auth";
import { auth } from "..";

const facebookAuthProvider = new FacebookAuthProvider();

export const signInWithFacebook = () =>
    signInWithPopup(auth, facebookAuthProvider);
