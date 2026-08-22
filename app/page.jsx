"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { socketUrl } from "./lib/socket";
import { authClient } from "./lib/auth-client";
import AuthForm from "./components/AuthForm";

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(undefined);

  useEffect(() => { authClient.getSession().then(({ data }) => setUser(data?.user || null)); }, []);

  async function createRoom() {
    setCreating(true);
    setError("");
    try {
      const response = await fetch(`${socketUrl}/api/rooms`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Could not create a room.");
      const { roomId: newRoomId } = await response.json();
      router.push(`/editor/${newRoomId}`);
    } catch (requestError) {
      setError(requestError.message || "Could not reach the collaboration server.");
      setCreating(false);
    }
  }

  function joinRoom(event) {
    event.preventDefault();
    const value = roomId.trim();
    if (!value) return;

    let normalizedRoomId = value;
    try {
      const inviteUrl = new URL(value);
      const pathParts = inviteUrl.pathname.split("/").filter(Boolean);
      normalizedRoomId = pathParts.at(-1) || "";
    } catch {
      // A plain room ID is valid too.
    }

    if (!normalizedRoomId) {
      setError("Enter a valid room ID or invite link.");
      return;
    }

    router.push(`/editor/${encodeURIComponent(normalizedRoomId)}`);
  }

  if (user === undefined) return null;
  if (!user) return <AuthForm onAuthenticated={setUser} />;

  return (
    <main className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl border border-[#30363d] bg-[#161b22] p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center font-bold text-lg">C</div>
          <div><h1 className="text-xl font-semibold">CodeTogether</h1><p className="text-sm text-gray-400">Real-time collaborative coding</p></div>
        </div>
        <button onClick={createRoom} disabled={creating} className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
          {creating ? "Creating room…" : "Create a new room"}
        </button>
        <div className="my-6 flex items-center gap-3 text-xs text-gray-500"><span className="h-px flex-1 bg-[#30363d]" /> OR <span className="h-px flex-1 bg-[#30363d]" /></div>
        <form onSubmit={joinRoom} className="space-y-3">
          <label className="block text-sm text-gray-300" htmlFor="room-id">Join with a room ID or invite link</label>
          <input id="room-id" value={roomId} onChange={(event) => setRoomId(event.target.value)} placeholder="Paste room ID or invite link" className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm outline-none focus:border-blue-500" />
          <button className="w-full rounded-md border border-[#30363d] py-2.5 text-sm hover:bg-[#21262d]">Join room</button>
        </form>
        {error && <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>}
      </section>
    </main>
  );
}
