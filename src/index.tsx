import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { App } from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorker from "./serviceWorker";

import { TelegramProvider } from "./context/TelegramProvider";
import {
    createBrowserRouter,
    createHashRouter,
    LoaderFunctionArgs,
    RouterProvider,
} from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import theme from "./theme/theme";
import Create from "./routes/create";

import "./index.css";
import Layout from "./routes/layout";
import MeetupPage from "./routes/meetup";
import { doc, getDoc } from "firebase/firestore";
import fire, { db } from "./firebase";
import { COLLECTION_NAME } from "./firebase/db/repositories/meetups";
import WebApp from "./routes/webapp";
import MeetupEditPage from "./routes/meetup/edit";
import AuthPage from "./routes/auth";
import PrivateRoutes from "./routes/PrivateRoutes";
import { WebUserProvider } from "./context/WebAuthProvider";
import MeetupsPage from "./routes/meetups";

async function loader({ params: { meetupId } }: LoaderFunctionArgs) {
    return {
        meetup: (await getDoc(doc(db, COLLECTION_NAME, meetupId || ""))).data(), // fetch shit here
    };
}

/**
 * React-router routes for handling viewing, creating, and home page
 *
 * Github doesn't support createBrowserRouter
 * @see https://stackoverflow.com/questions/71984401/react-router-not-working-with-github-pages
 */
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <Root />,
            },
            {
                path: "/auth",
                element: <AuthPage />,
            },
            {
                path: "/create",
                element: <Create />,
            },
            {
                path: "/meetup/:meetupId",
                element: <MeetupPage />,
                loader,
            },
        ],
    },
    {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <PrivateRoutes />,
                children: [
                    {
                        path: "/meetup/:meetupId/edit",
                        element: <MeetupEditPage />,
                        loader,
                    },
                    {
                        path: "/webapp",
                        element: <WebApp />,
                    },
                    {
                        path: "/meetups",
                        element: <MeetupsPage />,
                    },
                ],
            },
        ],
    },
]);

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = ReactDOM.createRoot(container);

root.render(
    <React.StrictMode>
        <ColorModeScript />
        <ChakraProvider theme={theme}>
            <TelegramProvider>
                <WebUserProvider>
                    <RouterProvider router={router} />
                </WebUserProvider>
                {/* <App /> */}
                {/* </RouterProvider> */}
            </TelegramProvider>
        </ChakraProvider>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
