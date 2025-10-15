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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Image {
  src: string;
  tags: string[];
  sourceUrl?: string;
}

const IMAGES_PER_PAGE = 24;

export function Gallery({ images: allImages }: { images: Image[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const filteredImages = allImages.filter((image) =>
    searchTerm === ""
      ? true
      : image.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
  );

  const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * IMAGES_PER_PAGE,
    currentPage * IMAGES_PER_PAGE
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
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {paginatedImages.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {paginatedImages.map(({ src, tags }) => (
              <div key={src} className="flex flex-col gap-2">
                <div className="group relative aspect-square">
                  <Image
                    src={src}
                    alt={`An otter with tags: ${tags.join(", ")}`}
                    fill
                    className="rounded-lg object-cover"
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
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleSearchChange(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4 py-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No images found. Try a different search!
          </p>
        </div>
      )}

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
              className="rounded-lg object-contain w-full h-auto"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
