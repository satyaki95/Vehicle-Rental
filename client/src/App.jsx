import { useState } from "react";
import Navbar from "./components/Navbar";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CarDetails from "./pages/CarDetails";
import Cars from "./pages/Cars";
import MyBookings from "./pages/MyBookings";
import Footer from "./components/Footer";
import OwnerLayout from "./pages/owner/Layout";
import OwnerDashboard from "./pages/owner/Dashboard";
import AddCar from "./pages/owner/AddCar";
import EditCar from "./pages/owner/EditCar";
import OwnerManageCars from "./pages/owner/ManageCars";
import OwnerManageBookings from "./pages/owner/ManageBookings";
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminManageCars from "./pages/admin/ManageCars";
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
        <Route path="/car-details/:id" element={<CarDetails />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="add-car" element={<AddCar />} />
          <Route path="manage-cars" element={<OwnerManageCars />} />
          <Route path="edit-car/:carId" element={<EditCar />} />
          <Route path="manage-bookings" element={<OwnerManageBookings />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="manage-cars" element={<AdminManageCars />} />
          <Route path="manage-bookings" element={<AdminManageBookings />} />
        </Route>
      </Routes>

      {!isOwnerPath && !isAdminPath && <Footer />}
    </>
  );
};

export default App;
