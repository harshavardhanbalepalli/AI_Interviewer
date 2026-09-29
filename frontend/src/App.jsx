import { BrowserRouter, Routes, Route } from "react-router-dom";

import UploadResume from "./pages/uploadResume";
import SelectJD from "./pages/selectJD";
import Interview from "./pages/Interview";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./pages/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInterviewDetail from "./pages/AdminInterviewDetail";
import AdminManageJDs from "./pages/AdminManageJDs";
import Showcase from "./pages/Showcase";
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
        <Route path="/showcase" element={<Showcase />} />

      </Routes>
      
    </BrowserRouter>
  );
}

export default App;