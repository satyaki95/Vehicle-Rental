import { Outlet } from "react-router-dom";
import NavbarOwner from "../../components/owner/NavbarOwner";
import Sidebar from "../../components/owner/Sidebar";
import { useAppContext } from "../../context/AppContext";
import { useEffect } from "react";

const Layout = () => {
  const { isOwner, isAuthLoading, navigate } = useAppContext();

  useEffect(() => {
    if (!isAuthLoading && !isOwner) {
      navigate("/");
    }
  }, [isAuthLoading, isOwner]);

  if (isAuthLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <NavbarOwner />
      <div className="flex">
        <Sidebar />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
