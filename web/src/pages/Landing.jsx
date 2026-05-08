import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  motion,
  useScroll,
  useSpring,
  AnimatePresence,
} from "framer-motion";

import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const [scrolled, setScrolled] =
    useState(false);

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const { scrollYProgress } =
    useScroll();

  const scaleX = useSpring(
    scrollYProgress,
    {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001,
    }
  );

  const featuresRef = useRef(null);

  const downloadsRef = useRef(null);

  const contactRef = useRef(null);

  useEffect(() => {
    const handleScroll = () =>
      setScrolled(window.scrollY > 20);

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
    });

    setMobileMenu(false);
  };

  const features = [
    {
      title: "AI Risk Detection",
      desc:
        "Detect hidden risks and suspicious clauses instantly using advanced AI models.",
      icon: "🎯",
      color:
        "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "PDF Contract Analysis",
      desc:
        "Upload contracts and receive instant AI-powered summaries and explanations.",
      icon: "📂",
      color:
        "from-purple-500/20 to-pink-500/20",
    },
    {
      title: "Risk Scoring",
      desc:
        "Get clear risk scores and understand policy safety levels easily.",
      icon: "⚖️",
      color:
        "from-amber-500/20 to-orange-500/20",
    },
    {
      title: "Website Monitoring",
      desc:
        "Analyze website privacy policies in real-time and monitor updates.",
      icon: "🛡️",
      color:
        "from-emerald-500/20 to-teal-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#02040a] text-white overflow-x-hidden">

      {/* PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-blue-500 origin-left z-[200]"
        style={{ scaleX }}
      />

      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">

        <div className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-blue-600/10 blur-[140px] rounded-full" />

        <div className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-purple-600/10 blur-[140px] rounded-full" />

      </div>

      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled
            ? "bg-black/50 backdrop-blur-3xl border-b border-white/10 py-4"
            : "bg-transparent py-6"
        }`}
      >

        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-4 cursor-pointer"
          >

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-black shadow-2xl shadow-blue-500/20">
              P
            </div>

            <div>

              <h2 className="text-2xl font-black tracking-tight">
                PolicyGuard AI
              </h2>

              <p className="text-xs text-white/40 uppercase tracking-[0.2em]">
                Enterprise AI Security
              </p>

            </div>

          </div>

          {/* DESKTOP MENU */}
          <div className="hidden xl:flex items-center gap-10 text-[11px] uppercase tracking-[0.2em] font-bold text-white/40">

            <button
              onClick={() =>
                scrollToSection(featuresRef)
              }
              className="hover:text-white transition"
            >
              Features
            </button>

            <button
              onClick={() =>
                scrollToSection(downloadsRef)
              }
              className="hover:text-white transition"
            >
              Downloads
            </button>

            <button
              onClick={() =>
                scrollToSection(contactRef)
              }
              className="hover:text-white transition"
            >
              Contact
            </button>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                navigate("/login")
              }
              className="hidden md:block text-sm font-bold text-white/50 hover:text-white transition"
            >
              Login
            </button>

            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() =>
                navigate("/register")
              }
              className="h-12 px-7 rounded-2xl bg-white text-black font-black uppercase tracking-[0.15em]"
            >
              Get Started
            </motion.button>

            {/* MOBILE BUTTON */}
            <button
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
              className="xl:hidden w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
            >
              ☰
            </button>

          </div>

        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>

          {mobileMenu && (
            <motion.div
              initial={{
                opacity: 0,
                y: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              className="xl:hidden mt-6 mx-6 rounded-[2rem] bg-[#0f172a]/90 border border-white/10 backdrop-blur-3xl p-6"
            >

              <div className="flex flex-col gap-5 text-sm font-bold uppercase tracking-[0.2em]">

                <button
                  onClick={() =>
                    scrollToSection(
                      featuresRef
                    )
                  }
                >
                  Features
                </button>

                <button
                  onClick={() =>
                    scrollToSection(
                      downloadsRef
                    )
                  }
                >
                  Downloads
                </button>

                <button
                  onClick={() =>
                    scrollToSection(
                      contactRef
                    )
                  }
                >
                  Contact
                </button>

              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </nav>

      {/* HERO */}
      <section className="relative z-10 pt-52 pb-40 px-6">

        <div className="max-w-7xl mx-auto text-center">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-3xl mb-10"
          >

            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />

            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-400">
              AI Legal Intelligence 2.0
            </span>

          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
            }}
            className="text-6xl md:text-[110px] font-black tracking-tighter leading-[0.9] mb-10"
          >

            Understand <br />

            <span className="bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent">
              before you accept.
            </span>

          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="text-white/40 text-xl max-w-3xl mx-auto leading-relaxed mb-16"
          >

            AI-powered platform that scans privacy policies,
            contracts, and websites to detect hidden legal risks instantly.

          </motion.p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">

            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                navigate("/register")
              }
              className="h-16 px-12 rounded-[2rem] bg-blue-600 hover:bg-blue-500 transition-all font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20"
            >
              Start Free Analysis
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                scrollToSection(
                  featuresRef
                )
              }
              className="h-16 px-12 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all font-black uppercase tracking-[0.2em]"
            >
              Explore Features
            </motion.button>

          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section
        ref={featuresRef}
        className="relative z-10 py-32 px-6"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-24">

            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
              Powerful AI Features
            </h2>

            <p className="text-white/40 text-xl max-w-3xl mx-auto">
              Enterprise-grade legal intelligence powered by advanced AI infrastructure.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

            {features.map((f, i) => (

              <motion.div
                key={i}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10"
              >

                <div
                  className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${f.color} blur-[90px]`}
                />

                <div className="relative z-10">

                  <div className="text-6xl mb-8">
                    {f.icon}
                  </div>

                  <h3 className="text-3xl font-black mb-5">
                    {f.title}
                  </h3>

                  <p className="text-white/40 leading-relaxed">
                    {f.desc}
                  </p>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </section>

      {/* DOWNLOADS */}
      <section
        ref={downloadsRef}
        className="relative z-10 py-40 px-6"
      >

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-24">

            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-blue-500/20 bg-blue-500/10 mb-8">

              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />

              <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">
                Platform Ecosystem
              </span>

            </div>

            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
              Access PolicyGuard Anywhere
            </h2>

            <p className="text-white/40 text-xl max-w-3xl mx-auto">
              Protect your privacy across desktop,
              browser, and mobile environments.
            </p>

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {[
              {
                icon: "📱",
                title: "Mobile App",
                desc:
                  "AI-powered mobile privacy intelligence for Android and iOS.",
                buttons: [
                  "App Store",
                  "Google Play",
                ],
              },
              {
                icon: "💻",
                title: "Desktop App",
                desc:
                  "Enterprise desktop monitoring for Windows, macOS, and Linux.",
                buttons: [
                  "Windows",
                  "macOS",
                  "Linux",
                ],
              },
              {
                icon: "🧩",
                title:
                  "Browser Extension",
                desc:
                  "Instant AI website scanning directly inside your browser.",
                buttons: [
                  "Chrome",
                  "Firefox",
                ],
              },
            ].map((item, index) => (

              <motion.div
                key={index}
                whileHover={{
                  y: -12,
                  scale: 1.02,
                }}
                className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10"
              >

                <div className="absolute top-0 right-0 w-52 h-52 bg-blue-500/10 blur-[100px]" />

                <div className="relative z-10">

                  <div className="text-7xl mb-10">
                    {item.icon}
                  </div>

                  <h3 className="text-4xl font-black mb-6">
                    {item.title}
                  </h3>

                  <p className="text-white/40 leading-relaxed mb-10">
                    {item.desc}
                  </p>

                  <div className="flex flex-wrap gap-4">

                    {item.buttons.map(
                      (btn, idx) => (

                        <button
                          key={idx}
                          className="h-12 px-6 rounded-2xl bg-white text-black font-black text-sm hover:scale-105 transition-all"
                        >
                          {btn}
                        </button>

                      )
                    )}

                  </div>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </section>

      {/* CONTACT */}
      <section
        ref={contactRef}
        className="relative z-10 py-40 px-6"
      >

        <div className="max-w-5xl mx-auto rounded-[4rem] border border-white/10 bg-black/40 backdrop-blur-3xl p-16 md:p-24 text-center">

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
            Contact PolicyGuard
          </h2>

          <p className="text-white/40 text-xl max-w-2xl mx-auto mb-14">
            Connect with our AI security specialists anytime.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">

            <button className="h-16 px-10 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.15em]">
              support@policyguard.ai
            </button>

            <button className="h-16 px-10 rounded-[2rem] border border-white/10 bg-white/[0.03] font-black uppercase tracking-[0.15em]">
              +91 9876543210
            </button>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-16 px-6">

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

          <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-black font-black text-3xl mb-8">
            P
          </div>

          <h2 className="text-4xl font-black mb-4">
            PolicyGuard AI
          </h2>

          <p className="text-white/30 mb-10 italic">
            “Understand before you accept.”
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm mb-10">

            <button
              onClick={() =>
                scrollToSection(
                  featuresRef
                )
              }
            >
              Features
            </button>

            <button
              onClick={() =>
                scrollToSection(
                  downloadsRef
                )
              }
            >
              Downloads
            </button>

            <button
              onClick={() =>
                scrollToSection(
                  contactRef
                )
              }
            >
              Contact
            </button>

          </div>

          <p className="text-white/20 text-xs uppercase tracking-[0.3em]">
            © 2026 PolicyGuard AI
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Landing;