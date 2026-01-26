"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [list, setList] = useState([]);
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
    return localStorage.getItem("adminToken");
  }

  async function load() {
    const res = await fetch("/api/admin/hotels", {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const json = await res.json();
    if (json.error) {
      router.push("/admin/login");
      return;
    }
    setList(json);
  }

  useEffect(() => {
    if (!token()) router.push("/admin/login");
    else load();
  }, []);

  async function add() {
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
    await fetch(`/api/admin/hotels?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    load();
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="text-xl font-bold mb-3">Admin Dashboard</h1>

      <div className="bg-white p-3 rounded shadow mb-4 space-y-2">
        <h2 className="font-semibold">Add Stay</h2>

        {["name", "price", "lat", "lng", "phone"].map((k) => (
          <input
            key={k}
            className="border p-1 w-full text-sm"
            placeholder={k}
            value={form[k]}
            onChange={(e) =>
              setForm((p) => ({ ...p, [k]: e.target.value }))
            }
          />
        ))}

        <select
          className="border p-1 w-full text-sm"
          value={form.type}
          onChange={(e) =>
            setForm((p) => ({ ...p, type: e.target.value }))
          }
        >
          <option value="hotel">Hotel</option>
          <option value="dharamshala">Dharamshala</option>
          <option value="ngo">NGO Stay</option>
            <option value="guest">Guest House</option>
        </select>
        <input
  className="border p-1 w-full text-sm"
  placeholder="Image URL"
  value={form.image}
  onChange={(e) =>
    setForm((p) => ({ ...p, image: e.target.value }))
  }
/>

        <button
          onClick={add}
          className="bg-black text-white px-3 py-1 text-sm"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {list.map((h) => (
          <div
            key={h._id}
            className="bg-white p-2 rounded shadow flex justify-between items-center text-sm"
          >
            <div>
              <b>{h.name}</b> · ₹{h.price} · {h.type}
            </div>
            <button
              onClick={() => del(h._id)}
              className="text-red-600 text-xs"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
