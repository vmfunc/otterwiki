import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "public/otters");
const MANIFEST_PATH = path.join(process.cwd(), "src/lib/images.json");

function generateImageManifest() {
  console.log("Generating image manifest from existing images...");
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.error("Otters directory does not exist. No images to catalog.");
    return;
  }
  const imageFiles = fs.readdirSync(OUTPUT_DIR);
  const manifest = imageFiles.map((file) => ({
    src: `/otters/${file}`,
    tags: ["otter"], // Default tag
    sourceUrl: "", // Not available from filesystem
  }));

  const libDir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  console.log(
    `Image manifest generated with ${manifest.length} images at ${MANIFEST_PATH}`
  );
}

generateImageManifest();
