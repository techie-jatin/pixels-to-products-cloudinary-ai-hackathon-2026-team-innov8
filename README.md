# Innov8 Studio
**Pixels to Products — Cloudinary AI Hackathon 2026**

## The Problem
E-commerce businesses and social media marketers often struggle to create high-quality, professional product lifestyle shots. Hiring photographers or buying expensive props takes time and money. Often, sellers only have a basic product photo on a plain background.

## The Solution
**AI Product Studio** allows anyone to upload a simple product photo and instantly generate professional lifestyle backgrounds using Cloudinary's Generative AI. 

**Track:** Generative Content Workflows (Track 2)

## How We Used Cloudinary
Cloudinary is deeply integrated into every layer of Innov8 Studio:
1. **Upload API**: We use `next-cloudinary`'s `CldUploadWidget` to securely upload raw product images to the cloud, automatically tagging them with `ai-product-studio` to organize our media.
2. **Generative AI Background Replacement**: We leverage Cloudinary's Generative Replace (`replaceBackground`) to transform the original image on the fly, interpreting detailed cinematic prompts.
3. **Generative Fill & Multi-Platform Formats**: We use `fillBackground` (Generative Outpainting) combined with `aspectRatio` and `crop="pad"` to automatically generate versions of the image for Instagram (1:1), Websites (16:9), and TikTok (9:16) without losing the product subject.
4. **Cloudinary Search API**: Our Team Asset Library at the bottom of the dashboard uses the Cloudinary Node.js SDK `cloudinary.search` to actively fetch and sync all images tagged by our app.
5. **Optimized Delivery & Downloads**: Assets are delivered via CDN with `f_auto, q_auto`. Users can also download generated variants directly using Cloudinary's `fl_attachment` transformation.

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Cloudinary environment variables. Rename `.env.local.example` to `.env.local` and add your credentials:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   NEXT_PUBLIC_CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```
   *Note: Ensure you have an unsigned upload preset named `ml_default` configured in your Cloudinary account.*
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Test It
1. Click "Select an Image" to upload a raw product photo (e.g., a coffee cup, a shoe, a bottle).
2. Click on a preset cinematic prompt or write a custom description in the left control panel.
3. Toggle between "Square", "Landscape", and "Portrait" to see Cloudinary Generative Fill outpaint the background to fit different social media formats.
4. Watch the Session History sidebar auto-save your variants instantly using CDN caching.
5. Hover over the generated image and click the Download button to save the final asset to your machine.
6. Scroll down to see the Cloudinary Search API populating the shared Team Asset Library with your uploads!
