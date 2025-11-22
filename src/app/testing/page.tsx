"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PhoneOTP() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) alert(error.message);
    else setShowOtp(true);
  };

  const verifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error) alert(error.message);
    else alert("Logged in successfully!");
  };

  return (
    <div className="p-4 space-y-4">

      {!showOtp && (
        <>
          <input
            className="border p-2 w-full"
            placeholder="Enter phone +91..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={sendOtp} className="bg-blue-600 text-white px-4 py-2">
            Send OTP
          </button>
        </>
      )}

      {showOtp && (
        <>
          <input
            className="border p-2 w-full"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp} className="bg-green-600 text-white px-4 py-2">
            Verify OTP
          </button>
        </>
      )}

    </div>
  );
}
