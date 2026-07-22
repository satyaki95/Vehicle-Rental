import { useEffect, useMemo, useState } from "react";
import Title from "../../components/owner/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
      }).format(new Date(date))
    : "-";

const ManageUsers = () => {
  const { axios } = useAppContext();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [search, setSearch] = useState("");

  const fetchAdminUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users");
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const expectedRole = activeTab === "agencies" ? "owner" : "user";
    const searchTerm = search.trim().toLowerCase();

    return users.filter((account) => {
      const matchesRole = account.role === expectedRole;
      const matchesSearch =
        !searchTerm ||
        account.name.toLowerCase().includes(searchTerm) ||
        account.email.toLowerCase().includes(searchTerm);
      return matchesRole && matchesSearch;
    });
  }, [activeTab, search, users]);

  const userCount = users.filter((account) => account.role === "user").length;
  const agencyCount = users.filter((account) => account.role === "owner").length;

  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <Title
        title="Manage Users and Agencies"
        subTitle="Review registered customers and rental agencies on the platform."
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
        <div className="flex gap-2 p-1 rounded-md bg-gray-100">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md text-sm ${activeTab === "users" ? "bg-white text-primary shadow-sm" : "text-gray-500"}`}
          >
            Users ({userCount})
          </button>
          <button
            onClick={() => setActiveTab("agencies")}
            className={`px-4 py-2 rounded-md text-sm ${activeTab === "agencies" ? "bg-white text-primary shadow-sm" : "text-gray-500"}`}
          >
            Rental Agencies ({agencyCount})
          </button>
        </div>

        <label className="flex items-center gap-2 w-full sm:w-72 px-3 py-2 border border-borderColor rounded-md text-sm">
          <img src={assets.search_icon} className="w-4 h-4" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="w-full outline-none"
          />
        </label>
      </div>

      <div className="max-w-5xl w-full rounded-md overflow-hidden border border-borderColor mt-6">
        <table className="w-full border-collapse text-left text-sm text-gray-600">
          <thead className="text-gray-500">
            <tr>
              <th className="p-3 font-medium">Account</th>
              <th className="p-3 font-medium max-md:hidden">Email</th>
              {activeTab === "agencies" && (
                <th className="p-3 font-medium">Vehicles</th>
              )}
              <th className="p-3 font-medium max-sm:hidden">Joined</th>
              <th className="p-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length ? (
              filteredUsers.map((account) => (
                <tr key={account._id} className="border-t border-borderColor">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={
                        account.image ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(account.name)}`
                      }
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-700">{account.name}</p>
                      <p className="text-xs text-gray-500 md:hidden">
                        {account.email}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 max-md:hidden">{account.email}</td>
                  {activeTab === "agencies" && (
                    <td className="p-3">{account.vehicleCount || 0}</td>
                  )}
                  <td className="p-3 max-sm:hidden">
                    {formatDate(account.createdAt)}
                  </td>
                  <td className="p-3">
                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-600">
                      {activeTab === "agencies" ? "Agency" : "User"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={activeTab === "agencies" ? 5 : 4}
                  className="p-8 text-center text-gray-500"
                >
                  No {activeTab === "agencies" ? "rental agencies" : "users"} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
