import fs from "fs";
import path from "path";
import axios from "axios";
import puppeteer from "puppeteer";

// --- Configuration ---
const HEADLESS_MODE = true; // Set to false to show the browser for debugging
const NUM_IMAGES_TO_FETCH = 2000; // Number of images to fetch
const OUTPUT_DIR = path.join(process.cwd(), "public/otters");
const MANIFEST_PATH = path.join(process.cwd(), "src/lib/images.json");
// ---------------------

async function fetchFromPixabay() {
  console.log("Launching headless browser to fetch images from Pixabay...");
  const browser = await puppeteer.launch({ headless: HEADLESS_MODE });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const imageUrls = new Set<string>();
  try {
    let pageNum = 1;
    while (imageUrls.size < NUM_IMAGES_TO_FETCH) {
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

      const newImageUrls = await page.evaluate(() => {
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

      if (newImageUrls.length === 0) {
        console.log("No more new images found on this page. Stopping.");
        break; // Exit if no images are found on the page
      }

      newImageUrls.forEach((url) => imageUrls.add(url));
      console.log(`Collected ${imageUrls.size} unique image URLs so far.`);

      pageNum++;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching from Pixabay:", message);
  } finally {
    await browser.close();
  }

  return Array.from(imageUrls).slice(0, NUM_IMAGES_TO_FETCH);
}

async function downloadImage(url: string, filename: string) {
  const outputPath = path.join(OUTPUT_DIR, filename);
  if (fs.existsSync(outputPath)) {
    return; // Silently skip if file already exists
  }
  const response = await axios({ url, responseType: "stream" });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  return new Promise<void>((resolve, reject) => {
    writer.on("finish", () => resolve());
    writer.on("error", reject);
  });
}

function generateImageManifest() {
  console.log("Generating image manifest...");
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log("Output directory does not exist. Skipping manifest generation.");
    return;
  }
  const imageFiles = fs.readdirSync(OUTPUT_DIR);
  const manifest = imageFiles.map((file) => ({
    src: `/otters/${file}`,
    tags: ["otter", "pixabay"], // Add more sophisticated tagging later if needed
    sourceUrl: "", // This would require storing metadata during download
  }));

  // Ensure lib directory exists
  const libDir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Image manifest generated with ${manifest.length} images.`);
}

async function main() {
  console.log("Starting image script...");
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allFetchedImageUrls = await fetchFromPixabay();

  let downloadedCount = 0;
  for (let i = 0; i < allFetchedImageUrls.length; i++) {
    const url = allFetchedImageUrls[i];
    const filename = `otter-${Date.now()}-${i}.jpg`;

    // A simple way to avoid re-downloading based on URL (less robust than checking content)
    // A more robust check would be to store sourceUrl in the manifest and check against that

    console.log(`Downloading ${url} to ${filename}`);
    try {
      await downloadImage(url, filename);
      downloadedCount++;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error(`Failed to download ${url}: ${message}`);
    }
  }

  console.log(`Downloaded ${downloadedCount} new images.`);

  // Always generate a fresh manifest after downloads are complete
  generateImageManifest();

  console.log("Script finished.");
}

main();
