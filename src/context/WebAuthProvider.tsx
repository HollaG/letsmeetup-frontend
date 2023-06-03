import { User } from "firebase/auth";
import { useState, createContext, useEffect } from "react";
import googleAuth from "../firebase/auth/google";
import { IMeetupUser } from "../firebase/db/repositories/users";

export type IWebUser = User;

export const WebUserContext = createContext<IMeetupUser | null>(null);

export const WebUserProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] = useState<IMeetupUser | null>(null);

    // listen to auth changes
    useEffect(() => {
        const unsubscribe = googleAuth.onAuthStateChanged(async (user) => {
            if (!user) {
                setUser(null);
                return;
            }
            const meetupUser: IMeetupUser = {
                id: user?.uid || "",
                first_name: user.displayName || "",
                email: user?.email || "",
                photo_url: user?.photoURL || "",
                type: "google",
                // last_name: user.displayName ? user.displayName.split(" ").slice(1, -1).join(" ") : "",
            };
            if (user) setUser(meetupUser);
            else setUser(null);

            console.log(user);
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
