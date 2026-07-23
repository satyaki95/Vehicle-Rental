import { useState } from "react";
import Title from "../../components/owner/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddVehicle = () => {
  const { axios, currency } = useAppContext();

  const [image, setImage] = useState(null);
  const [vehicle, setVehicle] = useState({
    vehicleType: "",
    vehicleNumber: "",
    brand: "",
    model: "",
    year: 0,
    pricePerDay: 0,
    pricePerWeek: 0,
    pricePerMonth: 0,
    category: "",
    transmission: "",
    fuel_type: "",
    seating_capacity: 0,
    location: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (isLoading) {
      return null;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("vehicleData", JSON.stringify(vehicle));

      const { data } = await axios.post("/api/owner/add-vehicle", formData);

      if (data.success) {
        toast.success(data.message);
        setImage(null);
        setVehicle({
          vehicleType: "",
          vehicleNumber: "",
          brand: "",
          model: "",
          year: 0,
          pricePerDay: 0,
          pricePerWeek: 0,
          pricePerMonth: 0,
          category: "",
          transmission: "",
          fuel_type: "",
          seating_capacity: 0,
          location: "",
          description: "",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-10 md:px-10 flex-1">
      <Title
        title="Add New Vehicle"
        subTitle="Fill in details to list a new vehicle for booking, including pricing, availability, and vehicle specifications."
      />

      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl"
      >
        {/* vehicle Image */}
        <div className="flex items-center gap-2 w-full">
          <label htmlFor="vehicle-image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_icon}
              className="h-14 rounded cursor-pointer"
            />
            <input
              type="file"
              id="vehicle-image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <p className="text-sm text-gray-500">
            Upload a picture of your vehicle
          </p>
        </div>

        {/* vehicle Brand & Model */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Vehicle Type</label>
            <select
              onChange={(e) =>
                setVehicle({ ...vehicle, vehicleType: e.target.value })
              }
              value={vehicle.vehicleType}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              required
            >
              <option value="">Select Type</option>
              <option value="2W">2W</option>
              <option value="4W">4W</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label>Brand</label>
            <input
              type="text"
              placeholder="e.g. BMW, Mercedes, Audi..."
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={vehicle.brand}
              onChange={(e) =>
                setVehicle({ ...vehicle, brand: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col w-full">
            <label>Model</label>
            <input
              type="text"
              placeholder="e.g. X5, E-Class, M4..."
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={vehicle.model}
              onChange={(e) =>
                setVehicle({ ...vehicle, model: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Vehicle Number</label>
            <input
              type="text"
              placeholder="e.g. MH-01-AB-1234"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={vehicle.vehicleNumber}
              onChange={(e) =>
                setVehicle({ ...vehicle, vehicleNumber: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col w-full">
            <label>Weekly Price ({currency})</label>
            <input
              type="number"
              placeholder="700"
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={vehicle.pricePerWeek}
              onChange={(e) =>
                setVehicle({ ...vehicle, pricePerWeek: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col w-full">
            <label>Monthly Price ({currency})</label>
            <input
              type="number"
              placeholder="2500"
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={vehicle.pricePerMonth}
              onChange={(e) =>
                setVehicle({ ...vehicle, pricePerMonth: e.target.value })
              }
            />
          </div>
        </div>

        {/* Vehicle year, price, category */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Year</label>
            <input
              type="number"
              placeholder={new Date().getFullYear()}
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={vehicle.year}
              onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
            />
          </div>

          <div className="flex flex-col w-full">
            <label>Daily Price ({currency})</label>
            <input
              type="number"
              placeholder="100"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={vehicle.pricePerDay}
              onChange={(e) =>
                setVehicle({ ...vehicle, pricePerDay: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col w-full">
            <label>Category</label>
            <select
              onChange={(e) =>
                setVehicle({ ...vehicle, category: e.target.value })
              }
              value={vehicle.category}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              {vehicle.vehicleType === "4W" ? (
                <>
                  <option value="">Select a category</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                </>
              ) : (
                <>
                  <option value="">Select a category</option>
                  <option value="Retro">Retro</option>
                  <option value="Sports">Sports</option>
                  <option value="Naked">Naked</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Vehicle transmission, fuel type, seating capacity */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Transmission</label>
            <select
              onChange={(e) =>
                setVehicle({ ...vehicle, transmission: e.target.value })
              }
              value={vehicle.transmission}
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">Select a transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label>Fuel Type</label>
            <select
              onChange={(e) =>
                setVehicle({ ...vehicle, fuel_type: e.target.value })
              }
              value={vehicle.fuel_type}
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">Select a fuel type</option>
              <option value="Gas">Gas</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label>Seating Capacity</label>
            <input
              type="number"
              placeholder="4"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={vehicle.seating_capacity}
              onChange={(e) =>
                setVehicle({ ...vehicle, seating_capacity: e.target.value })
              }
            />
          </div>
        </div>

        {/* Vehicle location */}

        <div className="flex flex-col w-full">
          <label>Location</label>
          <select
            onChange={(e) =>
              setVehicle({ ...vehicle, location: e.target.value })
            }
            value={vehicle.location}
            required
            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
          >
            <option value="">Select a location</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi </option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Calcutta">Calcutta</option>
          </select>
        </div>

        {/* Vehicle description */}

        <div className="flex flex-col w-full">
          <label>Description</label>
          <textarea
            rows={5}
            style={{ resize: "none" }}
            placeholder="e.g. A luxurious SUV with a spacious interior and a powerful engine."
            required
            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            value={vehicle.description}
            onChange={(e) =>
              setVehicle({ ...vehicle, description: e.target.value })
            }
          ></textarea>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer">
          <img src={assets.tick_icon} />
          {isLoading ? "Listing..." : "List Your Vehicle"}
        </button>
      </form>
    </div>
  );
};

export default AddVehicle;
