import { BrowserRouter, Routes, Route } from "react-router-dom";

import UploadResume from "./pages/UploadResume";
import SelectJD from "./pages/SelectJD";
import Interview from "./pages/Interview";
import Login from "./pages/login";
import Register from "./pages/Register";
import ProtectedRoute from "./pages/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInterviewDetail from "./pages/AdminInterviewDetail";
import AdminManageJDs from "./pages/AdminManageJDs";
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
        <Route path="/admin" element={<ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>} />
        <Route path="/admin/interview/:id" element={<ProtectedRoute adminOnly>
          <AdminInterviewDetail />
        </ProtectedRoute>} />
        <Route path="/admin/jds" element={<ProtectedRoute adminOnly>
          <AdminManageJDs />
        </ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
      
    </BrowserRouter>
  );
}

export default App;