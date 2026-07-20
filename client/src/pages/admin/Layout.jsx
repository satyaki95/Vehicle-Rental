import { Outlet } from "react-router-dom";
import NavbarAdmin from "../../components/admin/NavbarAdmin";
import SidebarAdmin from "../../components/admin/SidebarAdmin";
import { useAppContext } from "../../context/AppContext";
import { useEffect } from "react";

const Layout = () => {
  const { user, isAuthLoading, navigate } = useAppContext();

  useEffect(() => {
    if (!isAuthLoading && user?.role !== "admin") {
      navigate("/");
    }
  }, [isAuthLoading, user, navigate]);

  if (isAuthLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <NavbarAdmin />
      <div className="flex">
        <SidebarAdmin />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
