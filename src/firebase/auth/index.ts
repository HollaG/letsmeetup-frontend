import { signOut } from "firebase/auth";
import { auth } from "..";

export const signOutAll = () => signOut(auth);
