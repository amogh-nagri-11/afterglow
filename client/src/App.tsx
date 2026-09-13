import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { GuestOnly, RequireAuth } from "./components/RouteGuards";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pools from "./pages/Pools";
import PoolPage from "./pages/PoolPage";
import JoinPool from "./pages/JoinPool";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/pools" element={<Pools />} />
          <Route path="/pools/:poolId" element={<PoolPage />} />
          <Route path="/join/:code" element={<JoinPool />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
