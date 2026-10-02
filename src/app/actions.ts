"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getRecentAssets() {
  try {
    // Search for images uploaded specifically by this app using tags
    const result = await cloudinary.search
      .expression("tags:ai-product-studio")
      .sort_by("created_at", "desc")
      .max_results(12)
      .execute();

    return result.resources.map((res: any) => ({
      public_id: res.public_id,
      url: res.secure_url,
      created_at: res.created_at,
    }));
  } catch (error) {
    console.error("Error fetching assets from Cloudinary:", error);
    return [];
  }
}
