import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", path: "/dashboard", emoji: "📊" },
    { name: "PDF Analyzer", path: "/pdf-analyzer", emoji: "📄" },
    { name: "Web Analyzer", path: "/website-analyzer", emoji: "🌐" },
    { name: "History", path: "/history", emoji: "🕘" },
    { name: "Settings", path: "/settings", emoji: "⚙️" },
  ];

  return (
    <motion.div
      animate={{
        width: collapsed ? 100 : 280,
      }}
      className="h-screen sticky top-0 bg-white/[0.03] border-r border-white/10 backdrop-blur-3xl flex flex-col justify-between"
    >
      <div>
        <div className="p-6 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-2xl">
                P
              </div>

              <div>
                <h1 className="font-black text-xl">
                  PolicyGuard
                </h1>

                <p className="text-white/40 text-xs">
                  AI Platform
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() =>
              setCollapsed(!collapsed)
            }
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10"
          >
            ☰
          </button>
        </div>

        <div className="px-4 mt-8 flex flex-col gap-3">
          {menus.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all overflow-hidden ${
                  isActive
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : "hover:bg-white/[0.05]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
                    />
                  )}

                  <span className="relative z-10 text-2xl">
                    {item.emoji}
                  </span>

                  {!collapsed && (
                    <span className="relative z-10 font-semibold text-white/80">
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className="w-full h-14 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-400 font-bold"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
}

export default Sidebar;