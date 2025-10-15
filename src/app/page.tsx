import { Gallery } from "@/components/gallery";
import { ModeToggle } from "@/components/mode-toggle";
import fs from "fs";
import path from "path";

async function getOtterImages() {
  const ottersDir = path.join(process.cwd(), "public/otters");
  try {
    const imageFiles = fs.readdirSync(ottersDir);
    return imageFiles.map((file) => ({
      src: `/otters/${file}`,
      tags: ["otter"], // Default tags, can be expanded later
      sourceUrl: "", // Not available from filesystem
    }));
  } catch (error) {
    console.error("Could not read the otters directory:", error);
    return [];
  }
}

export default async function Home() {
  const images = await getOtterImages();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">
                otter.wiki
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container relative">
          <div className="py-12">
            <h1 className="text-3xl font-bold">otter.wiki</h1>
            <p className="text-muted-foreground">
              A collection of otter pictures.
            </p>
          </div>
          <Gallery images={images} />
        </div>
      </main>
    </div>
  );
}
