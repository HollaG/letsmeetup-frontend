import { signOut } from "firebase/auth";
import { auth } from "..";

export const signOutAll = (clearUser: () => void) => {
    signOut(auth);
    localStorage.removeItem("user");
    clearUser();
};
