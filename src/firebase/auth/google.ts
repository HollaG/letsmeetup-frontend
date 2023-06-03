import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import "firebase/compat/auth";
import fire from "..";

const googleAuthProvider = new GoogleAuthProvider();

const googleAuth = getAuth(fire);

export default googleAuth;

export const signInWithGoogle = () =>
    signInWithPopup(googleAuth, googleAuthProvider);
export const signOutWithGoogle = () => googleAuth.signOut();
