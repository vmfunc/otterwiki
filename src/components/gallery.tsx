"use client";

import Image from "next/image";
import { Download, Expand, Search } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const allImages = [
  { src: "/otters/otter-1.jpg", tags: ["cute", "swimming"] },
  { src: "/otters/otter-2.jpg", tags: ["sleeping", "fluffy"] },
  { src: "/otters/otter-3.jpg", tags: ["playing", "water"] },
  { src: "/otters/otter-4.jpg", tags: ["eating", "happy"] },
  { src: "/otters/otter-5.jpg", tags: ["family", "holding hands"] },
  { src: "/otters/otter-6.jpg", tags: ["curious", "whiskers"] },
];

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredImages = allImages.filter((image) =>
    image.tags.some((tag) => tag.includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for tags..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map(({ src, tags }) => (
          <div key={src} className="group relative">
            <Image
              src={src}
              alt={`An otter with tags: ${tags.join(", ")}`}
              width={500}
              height={500}
              className="rounded-lg object-cover aspect-square"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                onClick={() => setSelectedImage(src)}
                className="p-2 rounded-full bg-black/50 text-white"
              >
                <Expand className="h-6 w-6" />
              </button>
              <a
                href={`${src}?download=true`}
                download
                className="p-2 rounded-full bg-black/50 text-white"
              >
                <Download className="h-6 w-6" />
              </a>
            </div>
          </div>
        ))}
      </div>
      {selectedImage && (
        <Dialog open onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Otter</DialogTitle>
            </DialogHeader>
            <Image
              src={selectedImage}
              alt="An otter"
              width={1920}
              height={1080}
              className="rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
