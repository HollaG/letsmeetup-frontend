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
    // note: https://stackoverflow.com/questions/60497215/displayname-is-not-accessible-via-currentuser-in-auth-onauthstatechanged-fireb
    return signInAnonymously(auth).then((userCredentials) => {
        if (customName) {
            return updateProfile(userCredentials.user, {
                displayName: customName,
            }).then(() =>
                auth.currentUser
                    ? auth.currentUser?.reload().then(() => userCredentials)
                    : userCredentials
            );
        } else {
            return userCredentials;
        }
    });
};
export const signOutWithoutUsername = () => signOut(auth);
