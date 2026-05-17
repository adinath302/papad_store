"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [form,setForm] = useState({
    fullName:"",
    phone:"",
    address:"",
    city:"",
    state:"",
    pincode:"",
  });

  const submit = async () => {
    const res = await fetch("/api/checkout",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(form)
    });

    const data = await res.json();

    if(data.error){
      alert(data.error);
      return;
    }

    alert("Order created");
    window.location.href="/orders";
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">

      <input
        placeholder="Full Name"
        value={form.fullName}
        onChange={(e)=>
          setForm({
            ...form,
            fullName:e.target.value
          })
        }
      />

      <input
        placeholder="Phone"
        value={form.phone}
        onChange={(e)=>
          setForm({
            ...form,
            phone:e.target.value
          })
        }
      />

      <textarea
        placeholder="Address"
        value={form.address}
        onChange={(e)=>
          setForm({
            ...form,
            address:e.target.value
          })
        }
      />

      <button
        onClick={submit}
        className="bg-black text-white px-5 py-3"
      >
        Continue
      </button>

    </div>
  );
}