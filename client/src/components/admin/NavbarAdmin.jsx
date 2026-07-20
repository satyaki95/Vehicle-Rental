import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";

const NavbarAdmin = () => {
  const { user, logout } = useAppContext();

  return (
    <div className="flex items-center justify-between px-6 md:px-10 py-4 text-gray-500 border-b border-borderColor relative transition-all">
      <Link to="/admin">
        <img src={assets.logo} className="h-7" />
      </Link>

      <p>Welcome, {user?.name || "Admin"}</p>

      <div className="flex max-sm:flex-col items-end sm:items-center gap-6">
        <button
          onClick={logout}
          className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavbarAdmin;
