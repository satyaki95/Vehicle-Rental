import { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { assets } from "../../assets/assets";

const Dashboard = () => {
  const { axios, user, currency } = useAppContext();

  const [data, setData] = useState({
    totalVehicles: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
    registeredUsers: 0,
    bookingConversionRate: 0,
    vehicleUtilizationRate: 0,
    bookingConflictRate: 0,
    averageRentalDuration: 0,
    monthlyActiveUsers: 0,
  });

  const dashboardCards = [
    {
      title: "Total Vehicles",
      value: data.totalVehicles || 0,
      icon: assets.carIconColored,
    },
    {
      title: "Total Bookings",
      value: data.totalBookings,
      icon: assets.listIconColored,
    },
    {
      title: "Pending",
      value: data.pendingBookings,
      icon: assets.cautionIconColored,
    },
    {
      title: "Confirmed",
      value: data.completedBookings,
      icon: assets.listIconColored,
    },
  ];

  const analyticsCards = [
    { title: "Registered Users", value: data.registeredUsers },
    {
      title: "Booking Conversion",
      value: `${data.bookingConversionRate.toFixed(1)}%`,
    },
    {
      title: "Vehicle Utilization",
      value: `${data.vehicleUtilizationRate.toFixed(1)}%`,
    },
    {
      title: "Booking Conflicts",
      value: `${data.bookingConflictRate.toFixed(1)}%`,
    },
    {
      title: "Average Rental Duration",
      value: `${data.averageRentalDuration.toFixed(1)} days`,
    },
    { title: "Monthly Active Users", value: data.monthlyActiveUsers },
  ];

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard");
      if (data.success) {
        setData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="px-4 pt-10 md:px-10 flex-1">
      <Title
        title="Admin Dashboard"
        subTitle="Monitor platform-wide activity including vehicle listings, bookings, and revenue."
      />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor"
          >
            <div>
              <h1 className="text-xs text-gray-500">{card.title}</h1>
              <p className="text-lg font-semibold">{card.value}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <img src={card.icon} className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium">Platform Analytics</h2>
        <p className="text-gray-500">
          Key growth, utilization, and booking health metrics
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {analyticsCards.map((card) => (
            <div
              key={card.title}
              className="p-4 rounded-md border border-borderColor"
            >
              <h3 className="text-xs text-gray-500">{card.title}</h3>
              <p className="text-lg font-semibold mt-2">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6 mb-8 w-full">
        <div className="p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full">
          <h1 className="text-lg font-medium">Recent Bookings</h1>
          <p className="text-gray-500">Latest bookings across the platform</p>

          {data.recentBookings.map((booking, index) => {
            const vehicle = booking.vehicle;
            return (
              <div
                key={index}
                className="mt-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <img src={assets.listIconColored} className="h-5 w-5" />
                  </div>
                  <div>
                    <p>
                      {vehicle?.brand} {vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.createdAt?.split("T")[0]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <p className="text-sm text-gray-500">
                    {currency}
                    {booking.price}
                  </p>
                  <p className="px-3 py-0.5 border border-borderColor rounded-full text-sm">
                    {booking.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 md:p-6 mb-6 border border-borderColor rounded-md w-full md:max-w-xs">
          <h1 className="text-lg font-medium">Monthly Revenue</h1>
          <p className="text-gray-500">Revenue collected this month</p>
          <p className="text-3xl mt-6 font-semibold text-primary">
            {currency}
            {data.monthlyRevenue}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
