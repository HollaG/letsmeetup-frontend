import { User } from "firebase/auth";
import { useState, createContext, useEffect, useContext } from "react";
import { auth } from "../firebase";
import {
    createIfNotExists,
    IMeetupUser,
} from "../firebase/db/repositories/users";
import { ITelegramUser } from "../types/telegram";

export type IWebUser = User;

type IWebUserContext = {
    webUser: IMeetupUser | null | false;
    setTelegramWebUser?: (user: ITelegramUser) => void;
    clearUser?: () => void;
};

export const WebUserContext = createContext<IWebUserContext>({
    webUser: null,
});

const ANONYMOUS_NAMES =
    "alligator, anteater, armadillo, auroch, axolotl, badger, bat, bear, beaver, blobfish, buffalo, camel, chameleon, cheetah, chipmunk, chinchilla, chupacabra, cormorant, coyote, crow, dingo, dinosaur, dog, dolphin, dragon, duck, dumbo octopus, elephant, ferret, fox, frog, giraffe, goose, gopher, grizzly, hamster, hedgehog, hippo, hyena, jackal, jackalope, ibex, ifrit, iguana, kangaroo, kiwi, koala, kraken, lemur, leopard, liger, lion, llama, manatee, mink, monkey, moose, narwhal, nyan cat, orangutan, otter, panda, penguin, platypus, python, pumpkin, quagga, quokka, rabbit, raccoon, rhino, sheep, shrew, skunk, slow loris, squirrel, tiger, turtle, unicorn, walrus, wolf, wolverine, wombat".split(
        ", "
    );

const generateAnonName = (seed: string) => {
    // using the first letter/number of the seed, get the corresponding name
    const index = seed.charCodeAt(0) % ANONYMOUS_NAMES.length;
    return ANONYMOUS_NAMES[index];
};

export const generateRandomAnonName = () => {
    const index = Math.floor(Math.random() * ANONYMOUS_NAMES.length);
    return ANONYMOUS_NAMES[index];
};

export const WebUserProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    // false represents the Loading state. null represents the Logged Out state
    const [user, setUser] = useState<IMeetupUser | null | false>(false);

    // listen to auth changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                setUser(null);
                return;
            }
            const meetupUser: IMeetupUser = {
                id: user?.uid || "",
                first_name: user.displayName || "",
                email: user?.email || "",
                photo_url: user?.photoURL || "",
                type:
                    user.providerData.map((a) => a.providerId).join(",") ||
                    "Guest",
                // last_name: user.displayName ? user.displayName.split(" ").slice(1, -1).join(" ") : "",
            };

            if (!meetupUser.first_name) {
                // set a random name
                const randomName = capitalizeFirstLetter(
                    generateAnonName(user.uid)
                );
                meetupUser.first_name = `Anonymous ${randomName}`;
            }

            if (user) {
                setUser(meetupUser);
                localStorage.setItem("user", JSON.stringify(meetupUser));
            }

            if (user) {
                // add to db if not exist
                createIfNotExists(JSON.parse(JSON.stringify(meetupUser))).catch(
                    console.log
                );
            }
        });

        return () => {
            unsubscribe();
            localStorage.removeItem("user");
        };
    }, []);

    // listen to name changes
    useEffect(() => {
        const unsubscribe = auth.onIdTokenChanged((user) => {
            if (!user) return;
            const meetupUser: IMeetupUser = {
                id: user?.uid || "",
                first_name: user.displayName || "",
                email: user?.email || "",
                photo_url: user?.photoURL || "",
                type:
                    user.providerData.map((a) => a.providerId).join(",") ||
                    "Guest",
                // last_name: user.displayName ? user.displayName.split(" ").slice(1, -1).join(" ") : "",
            };

            if (!meetupUser.first_name) {
                // set a random name
                const randomName = capitalizeFirstLetter(
                    generateAnonName(user.uid)
                );
                meetupUser.first_name = `Anonymous ${randomName}`;
            }

            if (user) {
                setUser(meetupUser);
                localStorage.setItem("user", JSON.stringify(meetupUser));
            }
        });

        return () => {
            unsubscribe();
            localStorage.removeItem("user");
        };
    }, []);

    const savedUser = localStorage.getItem("user");
    let savedTelegramUser: ITelegramUser | null = null;
    if (savedUser) {
        try {
            savedTelegramUser = JSON.parse(savedUser);
        } catch (e) {
            console.log(e);
        }
    }

    const value: IWebUserContext = {
        webUser: savedTelegramUser || user,
        setTelegramWebUser: (user: ITelegramUser) => {
            const u = {
                ...user,
                id: user.id.toString(),
                type: "telegram",
                // override
                photo_url:
                    "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
            };
            setUser(u);
            localStorage.setItem("user", JSON.stringify(u));
        },
        clearUser: () => setUser(null),
    };
    return (
        <WebUserContext.Provider value={value}>
            {children}
        </WebUserContext.Provider>
    );
};

export const useWebUser = () => useContext(WebUserContext);

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
