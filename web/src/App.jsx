import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout, ProtectedLayout } from "./components/Shell";
import Landing from './pages/Landing';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import CreateNewPassword from './pages/auth/CreateNewPassword';
import Terms from './pages/auth/Terms';
import Home from './pages/app/Home';
import PickupDetails from './pages/app/PickupDetails';
import CreatePickup from './pages/app/CreatePickup';
import DailyPrices from './pages/app/DailyPrices';
import Profile from './pages/app/Profile';
import EditProfile from './pages/app/EditProfile';
import ChangePassword from './pages/app/ChangePassword';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/terms" element={<Terms />} />
      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-new-password" element={<CreateNewPassword />} />
      </Route>
      <Route path="/app" element={<ProtectedLayout />}>
        <Route index element={<Home />} />
        <Route path="pickup/:id" element={<PickupDetails />} />
        <Route path="create-pickup" element={<CreatePickup />} />
        <Route path="daily-prices" element={<DailyPrices />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
