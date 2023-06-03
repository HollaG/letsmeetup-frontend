import { User } from "firebase/auth";
import { useState, createContext, useEffect } from "react";
import googleAuth from "../firebase/auth/google";

export type IWebUser = User;

export const WebUserContext = createContext<IWebUser | null>(null);

export const WebUserProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] = useState<IWebUser | null>(null);

    // listen to auth changes
    useEffect(() => {
        const unsubscribe = googleAuth.onAuthStateChanged(async (user) => {
            if (user) setUser(user);

            // if (user) {
            //     // add to db if not exist
            //     createUserIfNotExists(
            //         JSON.parse(JSON.stringify(appUser))
            //     ).catch(console.log);
            // }
        });

        return () => unsubscribe();
    }, []);

    return (
        <WebUserContext.Provider value={user}>
            {children}
        </WebUserContext.Provider>
    );
};
