"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  LogOut,
  Building,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  Phone,
  LayoutDashboard,
  Search,
  Loader2,
} from "lucide-react";

export default function AdminDashboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    type: "dharamshala",
    lat: "",
    lng: "",
    phone: "",
    image: "",
  });
  const router = useRouter();

  function token() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken");
    }
    return null;
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hotels", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (json.error) {
        router.push("/admin/login");
        return;
      }
      setList(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token()) router.push("/admin/login");
    else load();
  }, []);

  async function add() {
    if (!form.name || !form.price || !form.lat || !form.lng) {
      alert("Please fill in required fields (Name, Price, Lat, Lng)");
      return;
    }

    const res = await fetch("/api/admin/hotels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        lat: Number(form.lat),
        lng: Number(form.lng),
      }),
    });

    const json = await res.json();
    if (json.error) {
      alert(json.error);
      return;
    }

    setForm({
      name: "",
      price: "",
      type: "dharamshala",
      lat: "",
      lng: "",
      phone: "",
      image: "",
    });
    load();
  }

  async function del(id) {
    if (!confirm("Are you sure you want to delete this property?")) return;

    await fetch(`/api/admin/hotels?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    load();
  }

  function logout() {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  }

  const filteredList = list.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans relative overflow-x-hidden">
      {/* --- Background Gradients --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-indigo-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-125 h-125 bg-purple-100 rounded-full blur-[100px] opacity-60" />
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-12 sm:pt-30 sm:pb-20">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Manage Stays & Properties</p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 shadow-sm px-5 py-2.5 rounded-full transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- Left Column--- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-500/5 rounded-4xl p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6 text-rose-500 font-bold">
                <Plus size={18} /> Add New Property
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                    Property Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      placeholder="e.g. Hillside Haven"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Price & Type Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Price (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <input
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        placeholder="999"
                        type="number"
                        value={form.price}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, price: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Type
                    </label>
                    <select
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      value={form.type}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, type: e.target.value }))
                      }
                    >
                      <option value="dharamshala">Dharamshala</option>
                      <option value="hotel">Hotel</option>
                      <option value="guest">Guest House</option>
                      <option value="ngo">NGO Stay</option>
                    </select>
                  </div>
                </div>

                {/* Coords Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Latitude
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <input
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        placeholder="28.7041"
                        type="number"
                        value={form.lat}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, lat: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Longitude
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <input
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-8 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        placeholder="77.1025"
                        type="number"
                        value={form.lng}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, lng: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Image */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      placeholder="+91 98765..."
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                    Image URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                      placeholder="https://..."
                      value={form.image}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, image: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={add}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                >
                  Add Property <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* --- Right Column --- */}
          <div className="lg:col-span-8 space-y-6">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-orange-100 rounded-xl border border-orange-100">
                  <span className="text-2xl font-bold text-orange-600">
                    {list.length}
                  </span>
                  <span className="text-xs text-orange-400 ml-2 font-bold uppercase">
                    Properties
                  </span>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  className="w-full bg-gray-50 border border-orange-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-orange-500"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-xl shadow-gray-200/40 min-h-125">
              <div className="flex items-center gap-2 mb-6 text-gray-400 font-bold uppercase text-xs tracking-wider">
                <LayoutDashboard size={14} /> Property List
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                  <p>Loading data...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredList.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No properties found.
                    </div>
                  )}

                  {filteredList.map((h) => (
                    <div
                      key={h._id}
                      className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {h.images && h.images[0] ? (
                            <img
                              src={h.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            {h.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium capitalize">
                              {h.type}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-gray-700">
                              ₹{h.price}
                            </span>
                            {h.phone && (
                              <>
                                <span>•</span>{" "}
                                <span className="flex items-center gap-0.5">
                                  <Phone size={10} /> {h.phone}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => del(h._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
