import React, { useState } from "react";
import { Input } from "@/components/ui"; // Ensure this matches your UI component structure
import { Lock, Mail, Recycle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Standard practice
    try {
      setIsSubmitting(true);
      if (!validate()) return;
      const result = await login(formData.email, formData.password);
      
      // Dynamic Routing: Send them to their specific dashboard
      const userRole = result.data?.user?.role;
      if (userRole === 'organization') {
        navigate("/organization/dashboard");
      } else {
        navigate("/dashboard"); // Civilian default
      }
    } catch (error) {
      setErrors({ main: "Login failed. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white font-['DM_Sans',sans-serif] lg:grid-cols-2">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* 🖼️ Image Side */}
      <div
        className="relative hidden bg-cover bg-center lg:block"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/55 via-emerald-800/35 to-white/30 p-16">
          <div className="flex h-full flex-col justify-end">
          <div className="mb-4 flex items-center gap-3 text-emerald-600">
            <Recycle size={32} strokeWidth={2.5}/>
            <span className="text-3xl font-extrabold tracking-tight text-white">Urban Community</span>
          </div>
          <h2 className="m-0 text-5xl font-bold leading-tight tracking-tight text-white">
            Smart waste solutions<br/> for a cleaner city.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-100">
            Connect with local initiatives, report issues, and manage your sustainability footprint effortlessly.
          </p>
          </div>
        </div>
      </div>

      {/* 📝 Form Side */}
      <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/40 sm:p-10">
          <div className="mb-10 text-center">
            <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Log in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {errors.main && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-center text-sm font-medium text-rose-700">
                {errors.main}
              </div>
            )}

            {/* Email Address */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
              >
                Email Address
              </label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                placeholder="you@example.com"
                required
                icon={Mail}
                onChange={handleChange("email")}
                error={errors.email}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
                >
                  Password
                </label>
                <a href="/forgot-password" className="text-xs font-semibold text-emerald-600 no-underline hover:text-emerald-700">
                  Forgot password?
                </a >
              </div>
              <Input
                type="password"
                id="password"
                value={formData.password}
                placeholder="••••••••"
                icon={Lock}
                required
                onChange={handleChange("password")}
                error={errors.password}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                  Authenticating...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to={ROUTES.HOME}
              state={{ openRegister: true }}
              className="font-semibold text-emerald-600 no-underline hover:text-emerald-700"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}