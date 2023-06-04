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
    return user || webUser ? (
        <Outlet />
    ) : (
        <Navigate to={`/auth?heading=${headingTo}/`} />
    );
};

export default PrivateRoutes;
