import { Route, Routes } from "react-router-dom";
import SetupStatus from "./features/dashboard/SetupStatus";

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<SetupStatus />} />
    </Routes>
  );
}
