import React from "react";
const FooterButtons = () => {
  return (
    <div className="grid grid-cols-2 gap-3 mt-6">
      <button className="bg-purple-600 hover:bg-purple-700 transition-all rounded-xl py-3 font-semibold">
        Scan Again
      </button>

      <button className="bg-white/10 hover:bg-white/20 transition-all rounded-xl py-3 font-semibold">
        Full Report
      </button>
    </div>
  )
}

export default FooterButtons;