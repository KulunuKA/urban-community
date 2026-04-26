import React, { useState } from "react";
import { Input } from "@/components/ui";
import { Lock, Mail, Recycle, User } from "lucide-react";
import { useCivilian } from "@/contexts/CivilianProvider";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function RegisterCivilian() {
  const { register } = useCivilian();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 characters required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      if (!validate()) return;
      await register(formData);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      setErrors({ main: "Registration failed. Please check your network." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "#ffffff", 
      display: "grid",
      gridTemplateColumns: "1fr",
      gridTemplateRows: "1fr",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
    },
    imageSide: {
  background: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "none", 
  position: "relative",
},
    imageOverlay: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,1))",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "4rem",
    },
    formSide: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "#ffffff",
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      padding: "1rem",
    },
    label: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#374151",
      marginBottom: "4px"
    },
    submitButton: {
      marginTop: "1.5rem",
      width: "100%",
      padding: "14px",
      background: isSubmitting ? "#a7f3d0" : "#10b981",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: 600,
      cursor: isSubmitting ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
    }
  };

  return (
    <div style={styles.container} className="responsive-container">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      
      {/* 🖼️ Left Side: Visual Content */}
      <div style={styles.imageSide} className="responsive-image">
        <div style={styles.imageOverlay}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#10b981", marginBottom: "1.5rem"}}>
            <Recycle size={36} strokeWidth={2.5}/>
            <span style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px", }}>Urban Community</span>
          </div>
          <h2 style={{ fontSize: "42px", fontWeight: 700, color: "#eeeef0", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            Be the change<br/> your city needs.
          </h2>
          <p style={{ 
  color: "#ffffff", 
  fontSize: "17px", 
  maxWidth: "400px", 
  lineHeight: 1.6,
  textShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)" 
}}>
  Join a collective effort to build sustainable urban spaces. Report issues, find recycling hubs, and grow your impact.
</p>
        </div>
      </div>

      {/* 📝 Right Side: Registration Form */}
      <div style={styles.formSide}>
        <div style={styles.card}>
          <div style={{ marginBottom: "2.5rem" }}>
            <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#111827", letterSpacing: "-1px", margin: 0 }}>
              Join Us
            </h1>
            <p style={{ fontSize: "16px", color: "#6b7280", marginTop: "8px" }}>
              Create your civilian account today.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {errors.main && (
              <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 500, textAlign: "center" }}>
                {errors.main}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={styles.label}>Full Name</label>
              <Input
                type="text"
                value={formData.name}
                placeholder="Jane Doe"
                icon={User}
                onChange={handleChange("name")}
                error={errors.name}
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={styles.label}>Email Address</label>
              <Input
                type="email"
                value={formData.email}
                placeholder="jane@example.com"
                icon={Mail}
                onChange={handleChange("email")}
                error={errors.email}
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={styles.label}>Password</label>
              <Input
                type="password"
                value={formData.password}
                placeholder="••••••••"
                icon={Lock}
                onChange={handleChange("password")}
                error={errors.password}
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={styles.submitButton}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {isSubmitting ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                  Getting Started...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", marginTop: "2.5rem" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#10b981", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 992px) {
          .responsive-container { grid-template-columns: 1.2fr 1fr !important; }
          .responsive-image { display: block !important; }
        }
      `}</style>
    </div>
  );
}