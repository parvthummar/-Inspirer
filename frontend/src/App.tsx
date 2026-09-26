import { Navigate, Route, Routes } from "react-router-dom";
import ToastProvider from "./components/ToastProvider";
import GuestOnly from "./features/auth/GuestOnly";
import LoginPage from "./features/auth/LoginPage";
import RequireAuth from "./features/auth/RequireAuth";
import SignupPage from "./features/auth/SignupPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import PreviewPage from "./features/workspace/PreviewPage";
import WorkspacePage from "./features/workspace/WorkspacePage";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />
        <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/project/:id" element={<RequireAuth><WorkspacePage /></RequireAuth>} />
        <Route path="/project/:id/preview" element={<RequireAuth><PreviewPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
