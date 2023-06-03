import { Navigate, Outlet } from "react-router-dom";
import { useTelegram } from "../context/TelegramProvider";
const PrivateRoutes = () => {
    const { user } = useTelegram();
    console.log(user);
    return user ? <Outlet /> : <Navigate to="/auth" />;
};

export default PrivateRoutes;
