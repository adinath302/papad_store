"use client";
import { useState } from "react";

const Home = () => {
  const [form, setForm] = useState({
    name: "",
    price: 0,
    description: "",
    stock: 0,
  });
  const HandleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const HandleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      }),
    });

    if (res.ok) {
      alert("Product added successfully!");
      setForm({
        name: "",
        price: 0,
        description: "",
        stock: 0,
      });
    } else {
      const error = await res.json();
      alert(`Error: ${error.error || "Failed to add product"}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div>
        <div className="text-2xl ">Product Form</div>
      </div>

      <div>
        <form action="" onSubmit={HandleSubmit}>
          Name:
          <input
            required
            value={form.name}
            type="text"
            name="name"
            placeholder=" Enter Product name"
            onChange={HandleChange}
          />
          <br />
          Price:
          <input
            required
            value={form.price}
            type="number"
            name="price"
            placeholder=" Enter Product price"
            onChange={HandleChange}
          />
          <br />
          Description:
          <input
            value={form.description}
            type="text"
            name="description"
            placeholder=" Enter Product description"
            onChange={HandleChange}
          />
          <br />
          Stock:
          <input
            value={form.stock}
            type="number"
            name="stock"
            placeholder=" Enter Product stock"
            onChange={HandleChange}
          />
          <br />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Home;
