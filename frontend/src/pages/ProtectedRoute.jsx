import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children // What is children here
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

  return children;
}

export default ProtectedRoute;