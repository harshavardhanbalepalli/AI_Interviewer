import { BrowserRouter, Routes, Route } from "react-router-dom";

import UploadResume from "./pages/UploadResume";
import SelectJD from "./pages/SelectJD";
import Interview from "./pages/Interview";
import Result from "./pages/Result";
import Login from "./pages/login";
import Register from "./pages/Register";
import ProtectedRoute from "./pages/ProtectedRoute";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute>
          <UploadResume />
          </ProtectedRoute>} />
        <Route path="/jds" element={<ProtectedRoute>
            <SelectJD />
          </ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute>
            <Interview />
          </ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute>
          <Result />
        </ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
      
    </BrowserRouter>
  );
}

export default App;