import Title from "../components/Title";
import VehicleCard from "../components/VehicleCard";
import { assets } from "../assets/assets";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "motion/react";

const Vehicles = () => {
  // getting search params from url
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState("");

  const pickupLocation = searchParams.get("pickupLocation");
  const pickupDate = searchParams.get("pickupDate");
  const returnDate = searchParams.get("returnDate");

  const { vehicles, axios } = useAppContext();

  const isSearchData = pickupLocation && pickupDate && returnDate;

  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [baseVehicles, setBaseVehicles] = useState([]);
  const [filters, setFilters] = useState({
    vehicleType: "",
    priceRange: "",
    rentalDuration: "",
    fuelType: "",
  });

  const getEffectivePrice = (vehicle, duration) => {
    switch (duration) {
      case "daily":
        return Number(filters.priceRange) >= vehicle.pricePerDay.toString();
      case "weekly":
        return Number(filters.priceRange) >= vehicle.pricePerWeek.toString();
      case "monthly":
        return Number(filters.priceRange) >= vehicle.pricePerMonth.toString();
    }
  };

  const applyFilter = () => {
    const sourceVehicles = baseVehicles.length > 0 ? baseVehicles : vehicles;
    const searchValue = input.trim().toLowerCase();

    let result = sourceVehicles.filter((vehicle) => {
      const matchesSearch =
        searchValue === "" ||
        vehicle.brand.toLowerCase().includes(searchValue) ||
        vehicle.model.toLowerCase().includes(searchValue) ||
        vehicle.category.toLowerCase().includes(searchValue) ||
        vehicle.transmission.toLowerCase().includes(searchValue) ||
        vehicle.fuel_type.toLowerCase().includes(searchValue);

      const matchesVehicle =
        !filters.vehicleType || vehicle.vehicleType === filters.vehicleType;
      const matchesFuel =
        !filters.fuelType || vehicle.fuel_type === filters.fuelType;
      const matchesPrice =
        !filters.priceRange ||
        getEffectivePrice(vehicle, filters.rentalDuration);

      return matchesSearch && matchesVehicle && matchesFuel && matchesPrice;
    });

    setFilteredVehicles(result);
  };

  const searchVehicleAvailability = async () => {
    const { data } = await axios.post("/api/bookings/check-availability", {
      location: pickupLocation,
      pickupDate,
      returnDate,
    });

    if (data.success) {
      const available = data.availableVehicles || data.availableCars || [];
      setBaseVehicles(available);
      setFilteredVehicles(available);
      if (available.length === 0) {
        toast("No Vehicles Available");
      }
      return null;
    }
  };

  useEffect(() => {
    if (isSearchData) {
      searchVehicleAvailability();
    } else if (vehicles.length > 0) {
      setBaseVehicles(vehicles);
      setFilteredVehicles(vehicles);
    }
  }, [vehicles, isSearchData]);

  useEffect(() => {
    applyFilter();
  }, [input, filters, baseVehicles, vehicles]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center py-20 bg-light max-md:px-4"
      >
        <Title
          title="Available Vehicles"
          subTitle="Browse our selection of vehicles available for your next adventure"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow"
        >
          <img
            src={assets.search_icon}
            alt="Search Icon"
            className="w-4.5 h-4.5 mr-2"
          />

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Search by make, model, or features"
            className="w-full h-full outline-none text-gray-500"
          />

          <img
            src={assets.filter_icon}
            alt="Search Icon"
            className="w-4.5 h-4.5 ml-2"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 max-w-140 w-full">
          <select
            value={filters.vehicleType}
            onChange={(e) =>
              setFilters({ ...filters, vehicleType: e.target.value })
            }
            className="border border-borderColor rounded-full px-3 py-2 text-sm outline-none"
          >
            <option value="">Vehicle Type</option>
            <option value="2W">2W</option>
            <option value="4W">4W</option>
          </select>
          <select
            value={filters.rentalDuration}
            onChange={(e) =>
              setFilters({ ...filters, rentalDuration: e.target.value })
            }
            className="border border-borderColor rounded-full px-3 py-2 text-sm outline-none"
          >
            <option value="">Duration</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <select
            value={filters.fuelType}
            onChange={(e) =>
              setFilters({ ...filters, fuelType: e.target.value })
            }
            className="border border-borderColor rounded-full px-3 py-2 text-sm outline-none"
          >
            <option value="">Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          <select
            value={filters.priceRange}
            onChange={(e) =>
              setFilters({ ...filters, priceRange: e.target.value })
            }
            className="border border-borderColor rounded-full px-3 py-2 text-sm outline-none"
          >
            <option value="">Max Price</option>
            <option value="100">Up to 100</option>
            <option value="500">Up to 500</option>
            <option value="1000">Up to 1000</option>
            <option value="2000">Up to 2000</option>
            <option value="3000">Up to 3000</option>
            <option value="4000">Up to 4000</option>
            <option value="5000">Up to 5000</option>
            <option value="10000">Up to 10000</option>
            <option value="20000">Up to 20000</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="px-6 md:px-16 lg:px-24 xl:px-32 mt-10"
      >
        <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto">
          Showing {filteredVehicles.length} Vehicles
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl max-auto">
          {filteredVehicles.map((vehicle, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              key={index}
            >
              <VehicleCard vehicle={vehicle} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Vehicles;
