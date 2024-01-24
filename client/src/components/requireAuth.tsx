"use client";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface RequireAuthProps {
    children: React.ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
    const { isUserAuthenticated } = useAppSelector(
        (state) => state.auth,
    );

    const navigate = useNavigate();

    useEffect(() => {
        if (!isUserAuthenticated) {
            navigate("/login");
        }
    })

    return <>{children}</>;
};

export default RequireAuth;