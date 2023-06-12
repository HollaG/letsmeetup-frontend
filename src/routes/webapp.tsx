import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WebApp = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const hasStartApp = window.location.href.includes("tgWebAppStartParam");

        // useEffect(() => {
        //     if (hasStartApp) {
        //         const startParam = location.pathname.split("/?").find(s => s.includes("tgWebAppStartParam"))?.replace("tgWebAppStartParam", "").replace("=", "").replace("#", "")

        //         if (startParam) {

        //         }
        //     } else {
        //         // redirect to 'create'
        //         return navigate("/create");
        //     }
        // }, [hasStartApp]);
        if (!hasStartApp) {
            // return <Navigate to="/create" state={{ from: location }} replace />;
            return navigate("/create");
        }

        const startParam = window.location.href
            .split("/")
            .find((s) => s.includes("tgWebAppStartParam"))
            ?.replace("tgWebAppStartParam", "")
            .replace("?", "")
            .replace("=", "")
            .replace("#", "");

        if (!startParam) {
            // return <Navigate to="/create" state={{ from: location }} replace />;
            return navigate("/create");
        }

        const type = startParam.split("__")[0];
        const val = startParam.split("__")[1];

        if (type === "indicate") {
            // return (
            //     <Navigate
            //         to={`/meetup/${val}`}
            //         state={{ from: location }}
            //         replace
            //     />
            // );
            return navigate(`/meetup/${val}`);
        }
    }, []);
    return (
        <>
            {/* <Heading> This is my home page it has nothing atm </Heading> */}
            {/* <Text> your param : {startParam}</Text> */}
        </>
    );
};

export default WebApp;
