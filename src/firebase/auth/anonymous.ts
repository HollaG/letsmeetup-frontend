import {
    getAuth,
    signInAnonymously,
    signOut,
    updateCurrentUser,
    updateProfile,
} from "firebase/auth";

import "firebase/compat/auth";
import fire from "..";

const auth = getAuth(fire);

// if a username is specified by the user, log them in
export const signInWithoutUsername = (customName?: string) => {
    return signInAnonymously(auth).then((userCredentials) => {
        if (customName)
            updateProfile(userCredentials.user, {
                displayName: customName,
            });
        return userCredentials;
    });
};
export const signOutWithoutUsername = () => signOut(auth);
