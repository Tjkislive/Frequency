"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const OPTIONS = {
  music: ["Hip-Hop", "Pop", "Rock", "Bollywood", "Lo-fi", "EDM", "K-Pop", "Classical", "Indie", "Metal"],
  movie: ["Action", "Comedy", "Sci-Fi", "Horror", "Anime", "Romance", "Thriller", "Documentary", "Fantasy", "Drama"],
  sport: ["Cricket", "Football", "Basketball", "Badminton", "Tennis", "F1", "Gym", "Chess", "Esports", "Running"],
} as const;

type Cat = keyof typeof OPTIONS;
const TITLES: Record<Cat, string> = {
  music: "What do you listen to?",
  movie: "What do you watch?",
  sport: "What do you play or follow?",
};
const STEPS: Cat[] = ["music", "movie", "sport"];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<Record<Cat, string[]>>({ music: [], movie: [], sport: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
    });
  }, [router]);

  const cat = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canContinue = picked[cat].length >= 2 && (step > 0 || name.trim().length > 0);

  function toggle(item: string) {
    setPicked((p) => ({
      ...p,
      [cat]: p[cat].includes(item) ? p[cat].filter((i) => i !== item) : [...p[cat], item],
    }));
  }

  async function finish() {
    setSaving(true);
    setError("");
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return router.push("/login");

    const { error: e1 } = await supabase.from("profiles").upsert({ id: user.id, name: name.trim() });
    if (e1) { setSaving(false); return setError(e1.message); }

    await supabase.from("interests").delete().eq("user_id", user.id);
    const rows = STEPS.flatMap((c) => picked[c].map((item) => ({ user_id: user.id, category: c, item })));
    const { error: e2 } = await supabase.from("interests").insert(rows);
    setSaving(false);
    if (e2) return setError(e2.message);
    router.push("/home");
  }

  return (
    <main className="min-h-screen bg-[#0B0B14] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-[#15152A] p-8">
        <p className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}</p>
        <h2 className="mt-1 text-2xl font-bold">{TITLES[cat]}</h2>
        <p className="text-sm text-gray-400">Pick at least 2</p>

        {step === 0 && (
          <input
            className="mt-4 w-full rounded-xl bg-[#0B0B14] p-3 outline-none"
            placeholder="Your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {OPTIONS[cat].map((item) => {
            const on = picked[cat].includes(item);
            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  on ? "bg-gradient-to-r from-violet-500 to-cyan-400 text-black font-semibold" : "bg-[#0B0B14] text-gray-300"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="text-gray-400 disabled:opacity-30"
          >
            Back
          </button>
          <button
            onClick={isLast ? finish : () => setStep(step + 1)}
            disabled={!canContinue || saving}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2 font-semibold text-black disabled:opacity-40"
          >
            {saving ? "Saving..." : isLast ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}