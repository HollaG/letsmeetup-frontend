import {
    FacebookAuthProvider,
    getAuth,
    OAuthProvider,
    signInWithPopup,
} from "firebase/auth";

import "firebase/compat/auth";
import fire, { auth } from "..";
const provider = new OAuthProvider("microsoft.com");
export const signInWithMicrosoft = () => signInWithPopup(auth, provider);
