import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";

import "firebase/compat/auth";
import fire, { auth } from "..";

export const createAccountEmail = (
    email: string,
    password: string,
    firstName: string,
    lastName?: string
) => {
    // return createUserWithEmailAndPassword(auth, email, password).then(
    //     (userCreds) => {
    //         return updateProfile(userCreds.user, {
    //             displayName: `${firstName} ${lastName || ""}`.trim(),
    //         }).then(() => {
    //             return auth.currentUser
    //                 ? auth.currentUser?.reload().then(() => userCreds)
    //                 : userCreds;
    //         });
    //     }
    // );

    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCreds) => {
            return updateProfile(userCreds.user, {
                displayName: `${firstName} ${lastName || ""}`.trim(),
            }).then(() => userCreds);
        })
        .then((userCreds) => {
            if (auth.currentUser) {
                auth.currentUser.reload().then(() => userCreds);
            }
            return userCreds;
        });
};

export const signInEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

// export const signOutWithGoogle = () => googleAuth.signOut();
