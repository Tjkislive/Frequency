"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return router.push("/login");
      const { data: p } = await supabase.from("profiles").select("name").eq("id", data.user.id).single();
      setName(p?.name ?? "");
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0B0B14] text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Welcome{name ? `, ${name}` : ""} 👋</h1>
      <p className="text-gray-400">Your matches will appear here soon.</p>
      <button
        onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
        className="text-sm text-gray-400 underline"
      >
        Log out
      </button>
    </main>
  );
}