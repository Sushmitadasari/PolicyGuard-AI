import React, {
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  loginUser,
} from "../services/authService";

import {
  useAuth,
} from "../context/AuthContext";

function Login() {
  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [remember,
    setRemember] =
    useState(true);

  const [loading,
    setLoading] =
    useState(false);

  const [forgotModal,
    setForgotModal] =
    useState(false);

  const [resetSuccess,
    setResetSuccess] =
    useState(false);

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [error,
    setError] =
    useState("");

  const handleLogin =
    async (e) => {
      e.preventDefault();

      setError("");

      try {
        setLoading(true);

        const res =
          await loginUser({
            email,
            password,
          });

        login(
          res.data.token,
          res.data.user
        );

        navigate(
          "/dashboard"
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Login failed"
        );
      } finally {
        setLoading(false);
      }
    };

  const handleReset = (
    e
  ) => {
    e.preventDefault();

    setResetSuccess(
      true
    );

    setTimeout(() => {
      setForgotModal(
        false
      );

      setResetSuccess(
        false
      );
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative flex items-center justify-center px-6 py-12">

      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-blue-600/20 blur-[140px] rounded-full animate-pulse" />

        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-purple-600/20 blur-[140px] rounded-full animate-pulse" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      </div>

      {/* HOME BUTTON */}
      <Link
        to="/"
        className="absolute top-8 left-8 z-50"
      >

        <motion.button
          whileHover={{
            scale: 1.05,
            y: -2,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] transition-all"
        >

          <span className="text-lg">
            ←
          </span>

          <span className="text-sm font-bold tracking-wide">
            Back Home
          </span>

        </motion.button>

      </Link>

      {/* MAIN */}
      <div className="relative z-10 w-full max-w-[1600px] grid grid-cols-1 xl:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <motion.div
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="hidden xl:flex flex-col justify-center relative"
        >

          <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full" />

          <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/20 blur-[120px] rounded-full" />

          <div className="flex items-center gap-5 mb-10">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-black shadow-2xl shadow-blue-500/30">
              P
            </div>

            <div>

              <h2 className="text-3xl font-black tracking-tight">
                PolicyGuard AI
              </h2>

              <p className="text-white/40 text-sm mt-1">
                Enterprise AI Security Platform
              </p>

            </div>

          </div>

          <h1 className="text-7xl font-black leading-[1.05] tracking-tight max-w-3xl mb-8">
            Welcome Back to AI-Powered Protection.
          </h1>

          <p className="text-xl text-white/60 leading-relaxed max-w-2xl mb-14">
            Securely access your AI legal intelligence dashboard and continue analyzing policies, contracts, and websites with enterprise-grade protection.
          </p>

        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="w-full flex justify-center"
        >

          <div className="w-full max-w-[620px] relative">

            <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full" />

            <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-8 md:p-12">

              <div className="mb-10">

                <h2 className="text-5xl font-black tracking-tight mb-4">
                  Sign In
                </h2>

                <p className="text-white/50 text-lg">
                  Access your enterprise AI dashboard securely.
                </p>

              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 font-semibold">
                  {error}
                </div>
              )}

              <form
                onSubmit={
                  handleLogin
                }
                className="space-y-6"
              >

                {/* EMAIL */}
                <div>

                  <label className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3 block">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="sushmita@company.com"
                    className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 px-6 outline-none focus:border-blue-500"
                  />

                </div>

                {/* PASSWORD */}
                <div>

                  <label className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold mb-3 block">
                    Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="••••••••"
                      className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 px-6 pr-16 outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute top-1/2 right-5 -translate-y-1/2 text-white/40 hover:text-white"
                    >

                      {showPassword
                        ? "🙈"
                        : "👁️"}

                    </button>

                  </div>

                </div>

                {/* OPTIONS */}
                <div className="flex items-center justify-between">

                  <label className="flex items-center gap-3 cursor-pointer">

                    <div
                      onClick={() =>
                        setRemember(
                          !remember
                        )
                      }
                      className={`w-6 h-6 rounded-md border flex items-center justify-center ${
                        remember
                          ? "bg-blue-600 border-blue-600"
                          : "border-white/20 bg-white/[0.03]"
                      }`}
                    >

                      {remember && (
                        <span className="text-xs">
                          ✓
                        </span>
                      )}

                    </div>

                    <span className="text-white/60">
                      Remember Me
                    </span>

                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setForgotModal(
                        true
                      )
                    }
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Forgot Password?
                  </button>

                </div>

                {/* LOGIN BUTTON */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  type="submit"
                  className="relative overflow-hidden w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-black text-lg shadow-2xl shadow-blue-500/30"
                >

                  <div className="flex items-center justify-center gap-4">

                    {loading && (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    )}

                    <span>
                      {loading
                        ? "Signing In..."
                        : "Access Dashboard"}
                    </span>

                  </div>

                </motion.button>

              </form>

              <div className="text-center mt-10">

                <p className="text-white/50">

                  Don’t have an account?{" "}

                  <Link
                    to="/register"
                    className="text-blue-400 hover:text-blue-300 transition-all font-semibold"
                  >
                    Create Account
                  </Link>

                </p>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

      {/* FORGOT PASSWORD */}
      <AnimatePresence>

        {forgotModal && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
          >

            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
              }}
              className="w-full max-w-lg rounded-[3rem] border border-white/10 bg-[#0f172a] p-10"
            >

              {!resetSuccess ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl mb-8 mx-auto">
                    🔑
                  </div>

                  <h3 className="text-3xl font-black text-center mb-4">
                    Forgot Password
                  </h3>

                  <p className="text-center text-white/60 leading-relaxed mb-10">
                    Password recovery system coming soon.
                  </p>

                  <button
                    onClick={() =>
                      setForgotModal(
                        false
                      )
                    }
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-black"
                  >
                    Close
                  </button>
                </>
              ) : null}

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

export default Login;