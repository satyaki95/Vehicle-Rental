import { useState } from "react";
import Navbar from "./components/Navbar";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import VehicleDetails from "./pages/VehicleDetails";
import Vehicles from "./pages/Vehicles";
import MyBookings from "./pages/MyBookings";
import Footer from "./components/Footer";
import OwnerLayout from "./pages/owner/Layout";
import OwnerDashboard from "./pages/owner/Dashboard";
import AddVehicle from "./pages/owner/AddVehicle";
import EditVehicle from "./pages/owner/EditVehicle";
import OwnerManageVehicles from "./pages/owner/ManageVehicles";
import OwnerManageBookings from "./pages/owner/ManageBookings";
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminManageVehicles from "./pages/admin/ManageVehicles";
import AdminManageUsers from "./pages/admin/ManageUsers";
import AdminManageBookings from "./pages/admin/ManageBookings";
import Login from "./components/Login";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";

const App = () => {
  const { showLogin, isOwner, isAuthLoading, user } = useAppContext();
  const isOwnerPath = useLocation().pathname.startsWith("/owner");
  const isAdminPath = useLocation().pathname.startsWith("/admin");
  return (
    <>
      <Toaster />
      {showLogin && <Login />}

      {!isOwnerPath && !isAdminPath && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={
            isAuthLoading ? (
              <div className="p-8">Loading...</div>
            ) : user?.role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : isOwner ? (
              <Navigate to="/owner" replace />
            ) : (
              <Home />
            )
          }
        />
        <Route path="/vehicle-details/:id" element={<VehicleDetails />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="add-vehicle" element={<AddVehicle />} />
          <Route path="manage-vehicles" element={<OwnerManageVehicles />} />
          <Route path="edit-vehicle/:vehicleId" element={<EditVehicle />} />
          <Route path="manage-bookings" element={<OwnerManageBookings />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="manage-vehicles" element={<AdminManageVehicles />} />
          <Route path="manage-users" element={<AdminManageUsers />} />
          <Route path="manage-bookings" element={<AdminManageBookings />} />
        </Route>
      </Routes>

      {!isOwnerPath && !isAdminPath && <Footer />}
    </>
  );
};

export default App;
