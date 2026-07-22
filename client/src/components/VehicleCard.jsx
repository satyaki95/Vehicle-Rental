import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const VehicleCard = ({ vehicle }) => {
  const item = vehicle;
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  if (!item) return null;

  return (
    <div
      onClick={() => {
        navigate(`/vehicle-details/${item._id}`);
        scrollTo(0, 0);
      }}
      className="group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt="Vehicle"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {item.isAvailable && (
          <p className="absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full">
            Available Now
          </p>
        )}

        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
          <span className="font-semibold">
            {currency}
            {item.pricePerDay}
          </span>
          <span className="text-sm text-white/80"> / day</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-medium">
              {item.brand} {item.model}
            </h3>
            <p className="text-muted-foreground text-sm">
              {item.category} ● {item.year}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-y-2 text-gray-600">
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.users_icon} alt="User Icon" className="h-4 mr-2" />
            <span>{item.seating_capacity} Seats</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.fuel_icon} alt="Fuel Icon" className="h-4 mr-2" />
            <span>{item.fuel_type}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.car_icon} alt="Vehicle Icon" className="h-4 mr-2" />
            <span>{item.transmission}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img
              src={assets.location_icon}
              alt="Location Icon"
              className="h-4 mr-2"
            />
            <span>{item.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
