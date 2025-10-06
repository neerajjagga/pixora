"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import UploadMediaButton from "./UploadMediaButton";
import { getUserMedia } from "@/actions/media";
import { motion } from "motion/react";
import { Media } from "@prisma/client";

interface StudioMediaSidebarProps {
    onImageSelect: (image: Media) => void;
}

export default function StudioMediaSidebar({ onImageSelect }: StudioMediaSidebarProps) {
    const [media, setMedia] = useState<Media[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const userMedia = await getUserMedia();
            setMedia(userMedia);
        } catch (error) {
            console.error("Failed to fetch media:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleImageClick = (image: Media) => {
        setSelectedImageId(image.id);
        onImageSelect(image);
    };

    if (loading) {
        return (
            <div className="w-110 h-[88vh] bg-secondary/5 rounded-md flex flex-col gap-2 p-3 border-2 border-gradient-primary">
                <div className="h-full w-full flex justify-center items-center">
                    <h1>Loading media...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="w-110 h-[88vh] bg-secondary/5 rounded-md flex flex-col gap-2 p-3 border-2 border-gradient-primary">
            <div>
                <UploadMediaButton onUploadSuccess={fetchMedia} />
            </div>

            {media.length === 0 && (
                <div className="h-full w-full flex justify-center items-center">
                    <h1>No media found</h1>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-6 overflow-y-auto">
                {media.map((img) => {
                    return (
                        <motion.div
                            key={img.id}
                            className={`relative w-full h-60 cursor-pointer rounded-xl overflow-hidden`}
                            onClick={() => handleImageClick(img)}
                        >
                            <Image
                                src={img.url}
                                alt="User media"
                                fill
                                className="rounded-xl object-cover"
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}