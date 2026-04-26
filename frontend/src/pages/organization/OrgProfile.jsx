import { Spinner } from "@/components/common/Spinner";
import { Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthProvider";
import { useOrganization } from "@/contexts/OrganizationProvider";
import UseOneImgUpload from "@/hooks/UseOneImgUpload";
import { message, Modal } from "antd";
import { Building2, CircleCheck, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const buildFormFromOrg = (data = {}) => ({
  name: data.name || "",
  email: data.email || "",
  phone: data.phone || "",
  address: data.address || "",
  profileImage: data.profileImage || "",
  description: data.description || "",
});

export default function OrgProfile() {
  const { organization, getProfile, updateProfile } = useOrganization();
  const { logout } = useAuth();
  const [form, setForm] = useState(buildFormFromOrg());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const { confirm } = Modal;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        await getProfile();
      } catch (fetchError) {
        console.error("Failed to fetch organization profile:", fetchError);
        message.error(fetchError || "Failed to fetch profile");
        setError(fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!organization) return;
    setForm(buildFormFromOrg(organization));
  }, [organization]);

  const hasChanges = useMemo(() => {
    if (!organization) return false;
    return (
      JSON.stringify(form) !== JSON.stringify(buildFormFromOrg(organization))
    );
  }, [organization, form]);

  const onFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onReset = () => {
    if (!organization) return;
    setForm(buildFormFromOrg(organization));
    message.info("Changes discarded.");
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      message.warning("Organization name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      profileImage: form.profileImage.trim(),
      description: form.description.trim(),
    };

    try {
      setSaving(true);
      await updateProfile(payload);
      message.success("Organization profile updated");
    } catch (saveError) {
      console.error("Failed to update organization profile:", saveError);
      message.error(saveError || "Failed to update profile");
      setError(saveError);
    } finally {
      setSaving(false);
    }
  };

  const onUploadProfileImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const imageUrl = await UseOneImgUpload({ file });
      onFieldChange("profileImage", imageUrl);
      message.success("Image uploaded. Save changes to update your profile.");
    } catch (uploadError) {
      console.error("Failed to upload organization image:", uploadError);
      message.error(uploadError?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const onLogout = () => {
    confirm({
      title: "Confirm Logout",
      content: "Are you sure you want to logout?",
      onOk: async () => {
        try {
          await logout();
        } catch (logoutError) {
          console.error("Failed to logout:", logoutError);
          message.error(logoutError?.message || "Failed to logout");
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Spinner label="Loading organization profile" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Organization Profile
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Keep your profile updated so citizens can trust and reach your team.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-700 ring-1 ring-emerald-100">
            <CircleCheck className="h-4 w-4" />
            Organization Account
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold tracking-wide text-rose-700 transition hover:bg-rose-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* main error message */}
      {error && (
        <div className="mx-auto max-w-4xl">
          <p>{error || "An unknown error occurred."}</p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-lg shadow-slate-200/40"
      >
        <div className="border-b border-slate-200/80 px-6 py-6 sm:px-8">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Profile Image
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt="Organization profile"
                  className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-medium text-slate-500">
                  No image
                </div>
              )}

              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                <span>{uploadingImage ? "Uploading image..." : "Upload image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUploadProfileImage}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Basic Details
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              id="name"
              type="text"
              label="Organization Name"
              icon={Building2}
              value={form.name}
              onChange={(val) => onFieldChange("name", val)}
              placeholder="Enter organization name"
              className="rounded-xl border-slate-300"
            />
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

        <div className="grid gap-4 px-6 py-7 sm:px-8 sm:grid-cols-2">
          <Input
            id="phone"
            type="text"
            label="Phone Number"
            icon={Phone}
            value={form.phone}
            onChange={(val) => onFieldChange("phone", val)}
            placeholder="e.g. +94 11 234 5678"
            className="rounded-xl border-slate-300"
          />
          <Input
            id="address"
            type="text"
            label="Address"
            icon={MapPin}
            value={form.address}
            onChange={(val) => onFieldChange("address", val)}
            placeholder="Enter organization address"
            className="rounded-xl border-slate-300"
          />
          <div className="sm:col-span-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Description
              </span>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                placeholder="Tell people what your organization does"
                rows="4"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
          </div>
        </div>

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
