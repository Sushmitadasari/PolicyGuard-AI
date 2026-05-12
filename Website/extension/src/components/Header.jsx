import { ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";

const Header = () => {
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const candidates = [
      "/policyguard-logo.png",
      "/policyguard-logo.svg",
      "/assets/policyguard-logo.png",
      "/assets/policyguard-logo.svg",
    ];
    let cancelled = false;

    (async () => {
      for (const p of candidates) {
        try {
          const res = await fetch(p, { method: "HEAD" });
          if (res.ok && !cancelled) {
            setLogoUrl(p);
            break;
          }
        } catch (e) {
          // ignore and try next
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-purple-600 p-2 rounded-xl">
          {logoUrl ? (
            <img src={logoUrl} alt="PolicyGuard" className="w-8 h-8 rounded-xl object-cover" />
          ) : (
            <ShieldCheck size={22} />
          )}
        </div>

        <div>
          <h1 className="text-lg font-bold">POLICYGUARD AI</h1>
          <p className="text-xs text-gray-400">AI Privacy Intelligence</p>
        </div>
      </div>

      <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
        LIVE
      </div>
    </div>
  );
};

export default Header;