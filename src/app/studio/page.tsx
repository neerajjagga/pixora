"use client"

import { useState } from "react";
import EditorCanvas from "@/components/studio/EditorCanvas/Index";
import StudioMediaSidebar from "@/components/studio/StudioMediaSidebar/Index";
import { Media } from "@prisma/client";

export default function Studio() {
    const [selectedImage, setSelectedImage] = useState<Media | null>(null);

    const handleImageSelect = (image: Media) => {
        setSelectedImage(image);
    };

    return (
        <div className="pt-21 min-h-screen w-full flex gap-4 pb-5 px-12">
            <StudioMediaSidebar onImageSelect={handleImageSelect} />
            <EditorCanvas selectedImage={selectedImage} />
        </div>
    );
}