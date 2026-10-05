"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMsg("");
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    router.push(mode === "signup" ? "/onboarding" : "/home");
  }

  return (
    <main className="min-h-screen bg-[#0B0B14] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-[#15152A] p-8 shadow-xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
          Frequency
        </h1>
        <p className="mt-2 text-gray-400">Find people on your wavelength.</p>

        <input
          className="mt-6 w-full rounded-xl bg-[#0B0B14] p-3 outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="mt-3 w-full rounded-xl bg-[#0B0B14] p-3 outline-none"
          placeholder="Password (min 6 characters)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 p-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </button>

        {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}

        <button
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="mt-4 text-sm text-gray-400 underline"
        >
          {mode === "signup" ? "Already have an account? Log in" : "New here? Sign up"}
        </button>

        <p className="mt-6 text-xs text-gray-500">
          Frequency is a friends-only space. Romantic or inappropriate messages are not allowed.
        </p>
      </div>
    </main>
  );
}