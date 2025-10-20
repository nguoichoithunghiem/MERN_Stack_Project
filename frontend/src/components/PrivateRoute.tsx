// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const token = localStorage.getItem("token"); // lấy token từ localStorage
    if (!token) {
        return <Navigate to="/login" replace />; // redirect về login nếu chưa login
    }
    return <>{children}</>;
};

export default PrivateRoute;
