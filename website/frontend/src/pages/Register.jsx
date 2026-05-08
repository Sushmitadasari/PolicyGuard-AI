import React, {
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  registerUser,
} from "../services/authService";

import {
  useAuth,
} from "../context/AuthContext";

function Register() {
  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [showConfirm,
    setShowConfirm] =
    useState(false);

  const [loading,
    setLoading] =
    useState(false);

  const [error,
    setError] =
    useState("");

  const [formData,
    setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      company: "",
      role: "",
    });

  const handleChange = (
    e
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleRegister =
    async (e) => {
      e.preventDefault();

      setError("");

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(true);

        const res =
          await registerUser({
            name:
              formData.name,
            email:
              formData.email,
            password:
              formData.password,
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
            "Registration failed"
        );
      } finally {
        setLoading(false);
      }
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

      {/* CONTAINER */}
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
            Start Protecting Yourself with AI Intelligence.
          </h1>

          <p className="text-xl text-white/60 leading-relaxed max-w-2xl mb-14">
            Analyze contracts, privacy policies, and websites with enterprise-grade AI security and futuristic legal intelligence.
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
                  Create Account
                </h2>

                <p className="text-white/50 text-lg">
                  Join the future of AI-powered legal intelligence.
                </p>

              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 font-semibold">
                  {error}
                </div>
              )}

              <form
                onSubmit={
                  handleRegister
                }
                className="space-y-6"
              >

                {/* NAME */}
                <input
                  type="text"
                  name="name"
                  required
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Full Name"
                  className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 px-6 outline-none focus:border-blue-500"
                />

                {/* EMAIL */}
                <input
                  type="email"
                  name="email"
                  required
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Email Address"
                  className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 px-6 outline-none focus:border-blue-500"
                />

                {/* PASSWORD */}
                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    required
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Password"
                    className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 px-6 pr-16 outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute top-1/2 right-5 -translate-y-1/2"
                  >
                    {showPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

                {/* CONFIRM PASSWORD */}
                <div className="relative">

                  <input
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    required
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Confirm Password"
                    className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 px-6 pr-16 outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        !showConfirm
                      )
                    }
                    className="absolute top-1/2 right-5 -translate-y-1/2"
                  >
                    {showConfirm
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

                {/* BUTTON */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  type="submit"
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-black text-lg shadow-2xl shadow-blue-500/30"
                >

                  <div className="flex items-center justify-center gap-4">

                    {loading && (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    )}

                    <span>
                      {loading
                        ? "Creating Account..."
                        : "Create Account"}
                    </span>

                  </div>

                </motion.button>

              </form>

              {/* LOGIN */}
              <div className="text-center mt-10">

                <p className="text-white/50">

                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="text-blue-400 hover:text-blue-300 transition-all font-semibold"
                  >
                    Sign In
                  </Link>

                </p>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

      <style>
        {`
          @keyframes shimmer {
            100% {
              transform: translateX(200%);
            }
          }
        `}
      </style>

    </div>
  );
}

export default Register;