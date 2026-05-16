"use client";
import { useState } from "react";

const Home = () => {
  const [form, setForm] = useState({
    name: "",
    price: "", // String representation prevents formatting bugs
    description: "",
    stock: "",
    image: "",
    thumbnail: "",
  });

  const HandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        description: form.description,
        stock: form.stock ? Number(form.stock) : 0,
        image: form.image,
        thumbnail: form.thumbnail,
      }),
    });

    if (res.ok) {
      alert("Product successfully published!");
      setForm({ name: "", price: "", description: "", stock: "", image: "", thumbnail: "" });
    } else {
      const error = await res.json();
      alert(`Error ${res.status}: ${error.details || error.error}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center p-6 bg-zinc-50 min-h-screen">
      <h1 className="text-2xl font-bold text-zinc-900">Add New Production Product</h1>
      <form onSubmit={HandleSubmit} className="flex flex-col gap-4 w-96 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <input required name="name" value={form.name} placeholder="Product Name" onChange={HandleChange} className="border p-2 rounded text-zinc-900" />
        <input required name="price" type="number" value={form.price} placeholder="Price (₹)" onChange={HandleChange} className="border p-2 rounded text-zinc-900" />
        <input name="description" value={form.description} placeholder="Description (Optional)" onChange={HandleChange} className="border p-2 rounded text-zinc-900" />
        <input name="image" value={form.image} placeholder="Main Image URL" onChange={HandleChange} className="border p-2 rounded text-zinc-900" />
        <input name="thumbnail" value={form.thumbnail} placeholder="Thumbnail Image URL" onChange={HandleChange} className="border p-2 rounded text-zinc-900" />
        <input name="stock" type="number" value={form.stock} placeholder="Available Stock" onChange={HandleChange} className="border p-2 rounded text-zinc-900" />
        <button type="submit" className="bg-zinc-900 text-white p-3 rounded-xl font-bold hover:bg-zinc-800 transition-all">Publish Product</button>
      </form>
    </div>
  );
};

export default Home;
