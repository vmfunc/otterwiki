import fs from "fs";
import path from "path";
import axios from "axios";
import puppeteer from "puppeteer";

// --- Configuration ---
const HEADLESS_MODE = false; // Set to true to hide the browser, false to show it for debugging
const NUM_IMAGES_TO_FETCH = 300; // Number of images to fetch
const OUTPUT_DIR = path.join(process.cwd(), "public/otters");
const GALLERY_COMPONENT_PATH = path.join(
  process.cwd(),
  "src/components/gallery.tsx"
);
// ---------------------

async function fetchFromPixabay() {
  console.log("Launching browser to fetch images from Pixabay...");
  const browser = await puppeteer.launch({ headless: HEADLESS_MODE });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const images: { url: string; tags: string[] }[] = [];
  try {
    let pageNum = 1;
    while (images.length < NUM_IMAGES_TO_FETCH) {
      console.log(`Pixabay: Navigating to page ${pageNum}...`);
      await page.goto(
        `https://pixabay.com/images/search/otter/?pagi=${pageNum}`,
        { waitUntil: "networkidle2" }
      );

      // Scroll down to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      const imageUrls = await page.evaluate(() => {
        const urls = new Set<string>();
        document.querySelectorAll('div[class*="cell--"] a img').forEach((el) => {
          const img = el as HTMLImageElement;
          const srcset = img.srcset;
          let highResUrl = "";

          if (srcset) {
            const sources = srcset.split(",").map((s) => s.trim().split(" "));
            const twoXSource = sources.find((s) => s[1] === "2x");
            if (twoXSource) {
              highResUrl = twoXSource[0];
            }
          }

          if (highResUrl) {
            urls.add(highResUrl);
          } else if (img.src) {
            urls.add(img.src); // Fallback to src
          }
        });
        return Array.from(urls);
      });

      if (imageUrls.length === 0) {
        console.log("No more images found. Stopping.");
        break; // Exit if no images are found on the page
      }

      for (const url of imageUrls) {
        if (images.length < NUM_IMAGES_TO_FETCH) {
          images.push({ url, tags: ["otter", "pixabay"] });
        } else {
          break;
        }
      }
      pageNum++;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching from Pixabay:", message);
  } finally {
    await browser.close();
  }

  return images.slice(0, NUM_IMAGES_TO_FETCH);
}

async function downloadImage(url: string, filename: string) {
  const outputPath = path.join(OUTPUT_DIR, filename);
  if (fs.existsSync(outputPath)) {
    console.log(`Skipping download, ${filename} already exists.`);
    return;
  }
  const response = await axios({ url, responseType: "stream" });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  return new Promise<void>((resolve, reject) => {
    writer.on("finish", () => resolve());
    writer.on("error", reject);
  });
}

function updateGalleryComponent(newImages: { src: string; tags: string[] }[]) {
  if (!fs.existsSync(GALLERY_COMPONENT_PATH)) {
    console.error(
      `Gallery component not found at: ${GALLERY_COMPONENT_PATH}`
    );
    return;
  }

  const data = fs.readFileSync(GALLERY_COMPONENT_PATH, "utf8");
  const imagesArrayRegex = /const allImages = (\[[\s\S]*?\]);/;
  const match = data.match(imagesArrayRegex);

  if (match) {
    let existingImages = [];
    try {
      // A bit of a hack to parse the JS array string into a JSON array
      const jsonString = match[1]
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":') // convert keys to be quoted
        .replace(/,(\s*[}\]])/g, "$1"); // remove trailing commas from arrays and objects
      existingImages = JSON.parse(jsonString);
    } catch (e) {
      console.error("Could not parse existing images from gallery.tsx.", e);
      return;
    }

    const updatedImages = [...existingImages, ...newImages];
    const uniqueImages = Array.from(
      new Map(updatedImages.map((item) => [item.src, item])).values()
    );

    const updatedImagesString = JSON.stringify(uniqueImages, null, 2);

    const updatedContent = data.replace(
      imagesArrayRegex,
      `const allImages = ${updatedImagesString};`
    );

    fs.writeFileSync(GALLERY_COMPONENT_PATH, updatedContent, "utf8");
    console.log("Gallery component updated successfully!");
  } else {
    console.error(
      "Could not find the 'allImages' array in the gallery file."
    );
  }
}

async function main() {
  console.log("Starting to fetch images...");
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const pixabayImages = await fetchFromPixabay();

  const allFetchedImages = [...pixabayImages];
  const newGalleryEntries = [];

  for (let i = 0; i < allFetchedImages.length; i++) {
    const img = allFetchedImages[i];
    const filename = `otter-${Date.now()}-${i}.jpg`;
    console.log(`Downloading ${img.url} to ${filename}`);
    try {
      await downloadImage(img.url, filename);
      newGalleryEntries.push({
        src: `/otters/${filename}`,
        tags: img.tags,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      console.error(`Failed to download ${img.url}: ${message}`);
    }
  }

  if (newGalleryEntries.length > 0) {
    updateGalleryComponent(newGalleryEntries);
  } else {
    console.log("No new images were fetched.");
  }

  console.log("Script finished.");
}

main();
