import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTelegram } from "../context/TelegramProvider";
import { useWebUser } from "../context/WebAuthProvider";
const PrivateRoutes = () => {
    const { user } = useTelegram();
    const webUser = useWebUser();
    // console.log(user);

    const location = useLocation();
    // console.log(location);

    const headingTo = encodeURIComponent(location.pathname);

    console.log(user || webUser ? "USER LOGGED" : "NOT LOGGED");

    // https://stackoverflow.com/questions/76377550/login-page-is-displayed-when-i-refresh-homepage-in-react-with-firebase-auth
    if (!user && webUser === false) {
        console.log("returning loading");
        return <> Loading... </>;
    }
    return user || webUser ? (
        <Outlet />
    ) : (
        <Navigate to={`/auth?heading=${headingTo}/`} />
    );
};

export default PrivateRoutes;
