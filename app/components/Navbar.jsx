"use client";

export default function Navbar() {
  return (
    <header className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center font-bold">
          C
        </div>

        <span className="font-semibold">
          CodeTogether
        </span>

        <span className="text-gray-500">/</span>

        <span className="text-sm text-gray-400">
          project-1
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Connected
        </div>

        <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md">
          Run
        </button>

        <button className="px-3 py-1.5 text-sm border border-[#30363d] hover:bg-[#21262d] rounded-md">
          Share
        </button>
      </div>
    </header>
  );
}