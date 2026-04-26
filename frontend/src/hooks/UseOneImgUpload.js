import axios from "axios";

const preset_key = import.meta.env.VITE_PRESET_KEY;
const cloud_name = import.meta.env.VITE_CLOUD_NAME;

const UseOneImgUpload = async ({ file }) => {
  if (!file) {
    throw new Error("Please select an image file to upload.");
  }

  if (!preset_key || !cloud_name) {
    throw new Error(
      "Missing Cloudinary config. Set VITE_PRESET_KEY and VITE_CLOUD_NAME in frontend/.env",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset_key);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      formData
    );

    const imageUrl = response.data?.secure_url;
    if (!imageUrl) {
      throw new Error("Image upload failed. Try again.");
    }

    return imageUrl;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to upload image."
    );
  }
};

export default UseOneImgUpload;
