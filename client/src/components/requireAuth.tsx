"use client";
import { useAppSelector } from "@/store/hooks";
import { useNavigate } from "react-router-dom";

interface RequireAuthProps {
    children: React.ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
    const { isUserAuthenticated, isLoading } = useAppSelector(
        (state) => state.auth,
    );

    const navigate = useNavigate();
    
    if (isLoading) {
        // return (
        //     <div className="my-8 flex justify-center">
        //         <Spinner />
        //     </div>
        // );
    }

    if (!isUserAuthenticated) {
        navigate("/login");
    }

    return <>{children}</>;
};

export default RequireAuth;