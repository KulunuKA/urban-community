import React, { useState } from "react";
import { Input } from "@/components/ui";
import { Home, Info, Lock, Mail, Phone, Recycle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationProvider";

export default function RegisterOrganization() {
  const { register } = useOrganization();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", description: "", address: "", phone: "", email: "", password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.address) newErrors.address = "Required";
    if (!formData.phone) newErrors.phone = "Required";
    if (!formData.email) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid";
    if (!formData.password) newErrors.password = "Required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 chars";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      if (!validate()) return;
      const result = await register(formData);
      if (result && (result.statusCode === 200 || result.statusCode === 201)) {
        navigate("/organization/dashboard");
      } else {
        setErrors({ main: result?.message || "Registration failed." });
      }
    } catch (error) {
      setErrors({ main: "Connection error. Is the backend running?" });
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
      background: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop')",
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
      maxWidth: "520px",
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
            <span style={{ fontSize: "32px", fontWeight: 800, color: "#111827", letterSpacing: "-1px"}}>Urban Community</span>
          </div>
          <h2 style={{ fontSize: "42px", fontWeight: 700, color: "#111827", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            Empower your<br/> organization.
          </h2>
          <p style={{ color: "#000000", fontSize: "17px", maxWidth: "400px", lineHeight: 1.6 }}>
            Create an Eco-Hub to manage sustainability initiatives and coordinate community events effectively.
          </p>
        </div>
      </div>

      {/* 📝 Right Side: Registration Form */}
      <div style={styles.formSide}>
        <div style={styles.card}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#111827", letterSpacing: "-1px", margin: 0 }}>
              Register Org
            </h1>
            <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "6px" }}>
              Start managing your community impact today.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {errors.main && (
              <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "10px", fontSize: "13px", textAlign: "center" }}>
                {errors.main}
              </div>
            )}

            {/* 2-Column Grid for basic info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Org Name</label>
                <Input type="text" value={formData.name} placeholder="Eco Team" icon={User} onChange={handleChange("name")} error={errors.name} style={{ background: "#f9fafb" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Phone</label>
                <Input type="text" value={formData.phone} placeholder="+94..." icon={Phone} onChange={handleChange("phone")} error={errors.phone} style={{ background: "#f9fafb" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={styles.label}>Description</label>
              <Input type="text" value={formData.description} placeholder="Our mission is..." icon={Info} onChange={handleChange("description")} error={errors.description} style={{ background: "#f9fafb" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={styles.label}>Address</label>
              <Input type="text" value={formData.address} placeholder="Street address" icon={Home} onChange={handleChange("address")} error={errors.address} style={{ background: "#f9fafb" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={styles.label}>Email Address</label>
              <Input type="email" value={formData.email} placeholder="org@example.com" icon={Mail} onChange={handleChange("email")} error={errors.email} style={{ background: "#f9fafb" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label style={styles.label}>Password</label>
              <Input type="password" value={formData.password} placeholder="••••••••" icon={Lock} onChange={handleChange("password")} error={errors.password} style={{ background: "#f9fafb" }} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={styles.submitButton}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {isSubmitting ? "Setting up..." : "Create Organization Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", marginTop: "1.5rem" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#10b981", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .responsive-container { grid-template-columns: 1fr 1fr !important; }
          .responsive-image { display: block !important; }
        }
      `}</style>
    </div>
  );
}