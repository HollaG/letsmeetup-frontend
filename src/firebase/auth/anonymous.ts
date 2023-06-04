import { getAuth, signInAnonymously } from "firebase/auth";

import "firebase/compat/auth";
import fire from "..";

const auth = getAuth(fire);

export const signInWithoutUsername = () => signInAnonymously(auth);
