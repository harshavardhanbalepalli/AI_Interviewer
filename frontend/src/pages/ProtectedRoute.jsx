import { Navigate } from "react-router-dom";
import { decodeToken } from "@/lib/utils";

function ProtectedRoute({
  children, // What is children here
  adminOnly = false
}) {

  const token =
    localStorage.getItem(
      "token"
    );

  if (!token) {

    return (
      <Navigate
        to="/login"
      />
    );

  }

  if (adminOnly) {
    const payload = decodeToken(token);

    if (payload?.role !== "admin") {
      return (
        <Navigate
          to="/"
        />
      );
    }
  }

  return children;
}

export default ProtectedRoute;