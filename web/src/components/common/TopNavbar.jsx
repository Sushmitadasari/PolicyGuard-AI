import React from "react";
import AIStatusBadge from "./AIStatusBadge";
import SearchBar from "./SearchBar";

function TopNavbar() {
  return (
    <div className="sticky top-0 z-40 h-24 bg-black/30 border-b border-white/10 backdrop-blur-3xl px-8 flex items-center justify-between">
      <SearchBar />

      <div className="flex items-center gap-6">
        <AIStatusBadge status="Active" />

        <div className="text-right">
          <p className="text-white font-semibold">
            Sushmita
          </p>

          <p className="text-white/40 text-sm">
            Enterprise User
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-black text-xl">
          S
        </div>
      </div>
    </div>
  );
}

export default TopNavbar;