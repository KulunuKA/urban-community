import { Spinner } from "@/components/common/Spinner";
import { Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthProvider";
import { useCivilian } from "@/contexts/CivilianProvider";
import UseOneImgUpload from "@/hooks/UseOneImgUpload";
import { Modal } from "antd";
import { CircleCheck, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const LANG_OPTIONS = [
  { value: "en", label: "English" },
  { value: "si", label: "Sinhala" },
  { value: "ta", label: "Tamil" },
];

const buildFormFromCivilian = (data = {}) => ({
  name: data.name || "",
  email: data.email || "",
  phone: data.phone || "",
  profileImage: data.profileImage || "",
  bio: data.bio || "",
  preferredLanguage: data.preferredLanguage || "en",
  location: {
    city: data.location?.city || "",
    district: data.location?.district || "",
    province: data.location?.province || "",
  },
});

export default function CivilianProfile() {
  const { civilian, getProfile, updateProfile } = useCivilian();
  const { logout } = useAuth();
  const [form, setForm] = useState(buildFormFromCivilian());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { confirm } = Modal;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        await getProfile();
      } catch (fetchError) {
        console.error("Failed to fetch profile:", fetchError);
        setError(fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!civilian) return;
    setForm(buildFormFromCivilian(civilian));
  }, [civilian]);

  const hasChanges = useMemo(() => {
    if (!civilian) return false;
    return (
      JSON.stringify(form) !== JSON.stringify(buildFormFromCivilian(civilian))
    );
  }, [civilian, form]);

  const onFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onLocationChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [key]: value,
      },
    }));
  };

  const onReset = () => {
    if (!civilian) return;
    setForm(buildFormFromCivilian(civilian));
    setError("");
    setSuccess("Changes discarded.");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      profileImage: form.profileImage.trim(),
      bio: form.bio.trim(),
      preferredLanguage: form.preferredLanguage,
      location: {
        city: form.location.city.trim(),
        district: form.location.district.trim(),
        province: form.location.province.trim(),
      },
    };

    try {
      setSaving(true);
      await updateProfile(payload);
      setSuccess("Profile details saved successfully.");
    } catch (saveError) {
      console.error("Failed to update profile:", saveError);
      setError(saveError || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const onUploadProfileImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    try {
      setUploadingImage(true);
      const imageUrl = await UseOneImgUpload({ file });
      onFieldChange("profileImage", imageUrl);
      setSuccess("Image uploaded successfully. You can save your changes now.");
    } catch (uploadError) {
      console.error("Failed to upload profile image:", uploadError);
      setError(uploadError?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const onLogout = async () => {
    try {
      await logout();
    } catch (logoutError) {
      console.error("Failed to logout:", logoutError);
      setError(logoutError?.message || "Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Spinner label="Loading civilian profile" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight text-slate-900"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            Profile Settings
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Keep your profile accurate so organizations can communicate with you
            effectively.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-700 ring-1 ring-emerald-100">
            <CircleCheck className="h-4 w-4" />
            Civilian Account
          </span>
          <button
            type="button"
            onClick={() =>
              confirm({
                title: "Confirm Logout",
                content: "Are you sure you want to logout?",
                onOk: async () => {
                  await logout();
                },
              })
            }
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold tracking-wide text-rose-700 transition hover:bg-rose-100"
          >
            Logout
          </button>
        </div>
      </header>

      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-lg shadow-slate-200/40"
      >
        <div className="hero-backdrop border-b border-slate-200/80 px-6 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Personal Information
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <UserRound className="h-4 w-4 text-slate-500" />
                Full Name
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
                placeholder="Enter your full name"
              />
            </label>

            <Input
              id="email"
              type="email"
              label="Email Address"
              icon={Mail}
              value={form.email}
              disabled
              className="rounded-xl border-slate-200"
            />
          </div>
        </div>

        <div className="grid gap-8 px-6 py-7 sm:px-8 lg:grid-cols-2">
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Contact
            </p>
            <label className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Phone className="h-4 w-4 text-slate-500" />
                Phone Number
              </span>
              <input
                type="text"
                value={form.phone}
                onChange={(event) => onFieldChange("phone", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
                placeholder="e.g. +94 77 123 4567"
              />
            </label>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-slate-700">
                Profile Image
              </span>

              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt="Profile preview"
                  className="h-28 w-28 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="inline-flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-medium text-slate-500">
                  No image uploaded
                </div>
              )}

              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                <span>
                  {uploadingImage ? "Uploading image..." : "Upload image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUploadProfileImage}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Bio</span>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(event) => onFieldChange("bio", event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
                placeholder="Share a short profile summary"
              />
            </label>
          </section>

          <section className="space-y-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <MapPin className="h-4 w-4 text-slate-500" />
              Location and Preferences
            </p>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">City</span>
              <input
                type="text"
                value={form.location.city}
                onChange={(event) =>
                  onLocationChange("city", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
                placeholder="Your city"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                District
              </span>
              <input
                type="text"
                value={form.location.district}
                onChange={(event) =>
                  onLocationChange("district", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
                placeholder="Your district"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Province
              </span>
              <input
                type="text"
                value={form.location.province}
                onChange={(event) =>
                  onLocationChange("province", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
                placeholder="Your province"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Preferred Language
              </span>
              <select
                value={form.preferredLanguage}
                onChange={(event) =>
                  onFieldChange("preferredLanguage", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
              >
                {LANG_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </section>
        </div>

        {(error || success) && (
          <div className="border-t border-slate-200/80 px-6 py-4 sm:px-8">
            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                {success}
              </p>
            ) : null}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onReset}
            disabled={saving || uploadingImage || !hasChanges}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving || uploadingImage || !hasChanges}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
