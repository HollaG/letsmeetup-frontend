import { GithubAuthProvider, signInWithPopup } from "firebase/auth";

import "firebase/compat/auth";
import { auth } from "..";

const githubAuthProvider = new GithubAuthProvider();

export const signInWithGithub = () => signInWithPopup(auth, githubAuthProvider);
