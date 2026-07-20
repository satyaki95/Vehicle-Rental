import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [cars, setCars] = useState([]);

  // Function to check if user is logged in
  const fetchUser = async () => {
    setIsAuthLoading(true);
    try {
      const { data } = await axios.get("/api/user/data");

      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");
        setIsAdmin(data.user.role === "admin");
      } else {
        setUser(null);
        setIsOwner(false);
        setIsAdmin(false);
        localStorage.removeItem("token");
        axios.defaults.headers.common["Authorization"] = "";
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
      setUser(null);
      setIsOwner(false);
      setIsAdmin(false);
      localStorage.removeItem("token");
      axios.defaults.headers.common["Authorization"] = "";
      navigate("/");
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Function to fetch all car from the server
  const fetchCars = async () => {
    try {
      const { data } = await axios.get("/api/user/cars");
      data.success ? setCars(data.cars) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Function to log out the user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    setIsAdmin(false);
    axios.defaults.headers.common["Authorization"] = "";
    navigate("/");
    toast.success("You have been logged out");
  };

  // UseEffect to retrieve the token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = storedToken;
    } else {
      setIsAuthLoading(false);
    }

    fetchCars();
  }, []);

  // UseEffect to fetch user data when token is available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
      fetchUser();
    }
  }, [token]);

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    isAdmin,
    setIsAdmin,
    isAuthLoading,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    fetchCars,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
