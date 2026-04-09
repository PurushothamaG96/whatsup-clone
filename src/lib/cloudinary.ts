import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: string,
  folder: string = "whatsapp-clone"
): Promise<{ url: string; public_id: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "auto",
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export async function uploadVideoToCloudinary(
  file: string,
  folder: string = "whatsapp-clone/videos"
): Promise<{ url: string; public_id: string; thumbnail: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "video",
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    thumbnail: cloudinary.url(result.public_id, {
      resource_type: "video",
      format: "jpg",
      transformation: [{ width: 300, height: 300, crop: "fill" }],
    }),
  };
}

export default cloudinary;
