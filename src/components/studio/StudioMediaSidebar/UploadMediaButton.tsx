"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from '@mdi/react';
import { mdiImageOutline } from '@mdi/js';
import { ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload, UploadResponse } from '@imagekit/next'
import { checkUsage, incrementUsageCount } from "@/actions/user";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { createMedia } from "@/actions/media";
import Image from "next/image";
import { AnimatePresence, easeIn, motion } from 'motion/react';

export default function UploadMediaButton() {
    const { update } = useSession();
    const inputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleClick = () => {
        // Trigger the hidden file input
        inputRef.current?.click();
    };

    const getUploadAuthParams = async () => {
        const response = await fetch("/api/upload-auth");

        if (!response.ok) {
            throw new Error("Failed to get upload auth params");
        }
        const data = await response?.json();

        return data;
    };

    const uploadToImageKit = async (file: File): Promise<UploadResponse> => {
        try {
            const { token, expire, signature, publicKey } =
                await getUploadAuthParams();

            const result = await upload({
                file,
                fileName: file?.name,
                folder: "pixora-uploads",
                expire,
                token,
                signature,
                publicKey,
                onProgress: (event) => {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setProgress((prev) => (percent > prev ? percent : prev));
                },
            });

            return result;
        } catch (error) {
            if (error instanceof ImageKitInvalidRequestError) {
                throw new Error("Invalid upload request");
            } else if (error instanceof ImageKitServerError) {
                throw new Error("ImageKit server error");
            } else if (error instanceof ImageKitUploadNetworkError) {
                throw new Error("Network error during upload");
            } else {
                throw new Error("Upload failed");
            }
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files?.length) return;

        setPreviewUrl(URL.createObjectURL(files[0]));
        setIsUploading(true);
        setProgress(0);

        try {
            const isUserHasCredits = await checkUsage();

            if (!isUserHasCredits) {
                toast.error("You don't have enough credits");
                return;
            }

            const { url, height, width, size, fileId } = await uploadToImageKit(files[0]);

            await createMedia({
                url: url || "",
                type: 'IMAGE',
                height: height || 0,
                width: width || 0,
                size: size || 0,
                providerKey: fileId || ""
            });

            await update();

            toast.success("Image uploaded successfully");
        } catch (err: any) {
            console.error("Upload failed:", err);
            toast.error(err || "Unable to upload media, try again later");
            return;
        } finally {
            setIsUploading(false);
            setPreviewUrl(null);
        }
    };

    return (
        <>
            <Button
                variant="hero"
                className="w-full font-bold text-lg py-6 hover:scale-102 cursor-pointer"
                onClick={handleClick}
            >
                <Icon path={mdiImageOutline}
                    size={1.2}
                />
                Upload Media
            </Button>
            <input
                type="file"
                ref={inputRef}
                accept="image/jpeg, image/png"
                className="hidden"
                onChange={handleFileChange}
            />

            <AnimatePresence mode="wait">
                {previewUrl && (
                    <motion.div
                        key="preview"
                        initial={{ y: -20, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full h-60 mt-4 rounded-xl overflow-hidden border shadow-lg"
                    >
                        <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />

                        {isUploading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white"
                            >
                                <span className="mb-2">Uploading... {progress}%</span>
                                <div className="w-3/4 h-2 bg-white/30 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-green-500"
                                        animate={{ width: `${progress}%` }}
                                        transition={{ ease: "easeInOut", duration: 0.3 }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
