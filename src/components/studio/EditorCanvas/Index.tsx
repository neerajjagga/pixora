"use client"

import { Button } from "@/components/ui/button";
import { Media } from "@prisma/client";
import {
    Scissors,
    Type,
    Save,
    Download,
    Image as ImageIcon,
    Expand,
    LucideIcon,
    X,
    Check,
    Loader
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditorCanvasProps {
    selectedImage: Media | null;
}

interface ToolType {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    description: string;
    hasPrompt?: boolean;
}


export default function EditorCanvas({ selectedImage }: EditorCanvasProps) {
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [toolPrompts, setToolPrompts] = useState<Record<string, string>>({});
    const [showPromptInput, setShowPromptInput] = useState<string | null>(null);
    const [promptValue, setPromptValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (selectedImage) {
            setProcessedImage(selectedImage.url);
        }
    }, [selectedImage]);


    const primaryTools: ToolType[] = [
        { id: "e-bgremove", name: "Remove Background", icon: Scissors, color: "primary", description: "Remove background with AI" },
        { id: "e-removedotbg", name: "Remove Background (Pro)", icon: Scissors, color: "secondary", description: "High-quality background removal" },
        { id: "e-changebg", name: "Change Background", icon: Expand, color: "primary", description: "Replace background with AI", hasPrompt: true },
        { id: "e-edit", name: "AI Edit", icon: Type, color: "secondary", description: "Edit image with text prompts", hasPrompt: true },
        { id: "bg-genfill", name: "Generative Fill", icon: Expand, color: "primary", description: "Fill empty areas with AI", hasPrompt: true },
    ];

    const getImageKitTransform = (toolId: string, prompt?: string): string => {
        const transforms: Record<string, string> = {
            "e-bgremove": "e-bgremove",
            "e-removedotbg": "e-removedotbg",
            "e-changebg": prompt ? `e-changebg-prompt-${encodeURIComponent(prompt)}` : "e-changebg",
            "e-edit": prompt ? `e-edit:${encodeURIComponent(prompt)}` : "e-edit",
            "bg-genfill": prompt ? `bg-genfill:${encodeURIComponent(prompt)}` : "bg-genfill",
        };
        return transforms[toolId] || "";
    };

    const pollForImageReady = async (toolId: string, prompt?: string) => {
        if (!selectedImage) return;

        const pollInterval = 3000;
        const maxAttempts = 100;
        let attempts = 0;

        const poll = async (): Promise<void> => {
            attempts++;

            const transform = getImageKitTransform(toolId, prompt);
            const url = `${selectedImage.url}?tr=${transform}`;

            try {
                const response = await fetch(url, {
                    method: "GET",
                    cache: "no-cache",
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });

                const contentType = response.headers.get('content-type');
                const isImage = contentType && contentType.startsWith('image/');

                if (response.ok && isImage) {
                    setProcessedImage(url);
                    setIsProcessing(false);

                    const tool = primaryTools.find(t => t.id === toolId);
                    toast.success(`${tool?.name || 'Tool'} completed successfully!`);
                    return;
                } else if (response.ok && !isImage) {

                } else {

                }
            } catch (err) {

            }

            if (attempts < maxAttempts) {
                setTimeout(poll, pollInterval);
            } else {
                setIsProcessing(false);
                toast.error("Image processing timed out. Please try again.");
                setProcessedImage(selectedImage.url);
                setActiveTool(null);
            }
        };

        poll();
    };

    const handleToolClick = (toolId: string) => {
        if (!selectedImage) {
            toast.error("Please select an image first");
            return;
        }

        const tool = primaryTools.find(t => t.id === toolId);
        if (!tool) return;

        if (activeTool === toolId) {
            setActiveTool(null);
            setProcessedImage(selectedImage.url);
            toast.success(`${tool.name} removed`);
        } else {
            setActiveTool(toolId);
            setIsProcessing(true);
            toast.success(`Processing ${tool.name}...`);

            pollForImageReady(toolId);
        }
    };

    const handleToolWithPrompt = (toolId: string) => {
        if (!selectedImage) {
            toast.error("Please select an image first");
            return;
        }

        setShowPromptInput(toolId);
        setPromptValue(toolPrompts[toolId] || "");
    };

    const applyToolWithPrompt = () => {
        if (!showPromptInput || !selectedImage || !promptValue.trim()) {
            toast.error("Please enter a prompt");
            return;
        }

        const tool = primaryTools.find(t => t.id === showPromptInput);
        if (!tool) return;

        const toolId = showPromptInput;
        setShowPromptInput(null);
        setIsProcessing(true);

        setActiveTool(toolId);
        setToolPrompts(prev => ({ ...prev, [toolId]: promptValue }));

        toast.success(`Processing ${tool.name} with prompt: "${promptValue}"`);

        pollForImageReady(toolId, promptValue);

        setPromptValue("");
    };

    const updateImage = (toolId: string) => {
        if (!selectedImage) return;
        const transform = getImageKitTransform(toolId, toolPrompts[toolId]);
        const newUrl = `${selectedImage.url}?tr=${transform}`;
        setProcessedImage(newUrl);
    };

    const updateImageWithPrompt = (toolId: string, prompt: string) => {
        if (!selectedImage) {
            return;
        }
        const transform = getImageKitTransform(toolId, prompt);
        const newUrl = `${selectedImage.url}?tr=${transform}`;
        setProcessedImage(newUrl);
    };



    const handleExport = async (format: 'jpg' | 'png') => {
        if (!processedImage) {
            toast.error("No image to export");
            return;
        }

        try {
            const response = await fetch(processedImage);
            if (!response.ok) {
                throw new Error('Image not accessible');
            }

            const link = document.createElement('a');
            link.href = processedImage;
            link.download = `pixora-edited-${Date.now()}.${format}`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Image exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error("Failed to export image. Please try again.");
        }
    };

    const handleSaveToGallery = () => {
        if (!processedImage) {
            toast.error("No image to save");
            return;
        }

        toast.success("Image saved to gallery");
    };



    return (
        <div className="flex w-full h-[88vh] bg-background text-foreground">
            <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center bg-background p-8">
                    {processedImage ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="bg-card rounded-lg p-4 shadow-glow-subtle max-w-full max-h-full">
                                <div className="relative flex items-center justify-center">
                                    <Image
                                        src={processedImage}
                                        alt="Selected image"
                                        width={selectedImage?.width || 400}
                                        height={selectedImage?.height || 300}
                                        className="max-w-full max-h-[60vh] object-contain rounded-md"
                                        priority
                                        style={{ width: 'auto', height: 'auto' }}
                                        unoptimized
                                    />

                                    {isProcessing && (
                                        <motion.div
                                            className="absolute inset-0 bg-black/50 rounded-md flex flex-col items-center justify-center backdrop-blur-sm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="bg-card/90 rounded-lg p-6 flex flex-col items-center space-y-3 shadow-xl">
                                                <Loader className="w-8 h-8 text-primary animate-spin" />
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-foreground">Processing Image</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        AI is working on your image...
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                                {selectedImage && (
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            {selectedImage.width} × {selectedImage.height} • {Math.round(selectedImage.size / 1024)} KB
                                        </p>
                                        {activeTool && (
                                            <div className="mt-2 flex flex-wrap justify-center gap-1">
                                                {(() => {
                                                    const tool = primaryTools.find(t => t.id === activeTool);
                                                    return tool ? (
                                                        <span key={activeTool} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                                            {tool.name}
                                                        </span>
                                                    ) : null;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <ImageIcon className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg text-muted-foreground mb-2">Select an image to start editing</p>
                            <p className="text-sm text-muted-foreground">Choose an image from the sidebar to start editing with AI tools.</p>
                        </div>
                    )}
                </div>

                <div className="bg-card border-t border-card-border p-4 flex items-center justify-between">
                    <Button
                        variant="outline"
                        className="flex items-center space-x-2"
                        onClick={handleSaveToGallery}
                        disabled={!processedImage || isProcessing}
                    >
                        <Save className="w-4 h-4" />
                        <span>Save to My Gallery</span>
                    </Button>
                    <div className="flex space-x-3">
                        <Button
                            variant="outline"
                            className="flex items-center space-x-2"
                            onClick={() => handleExport('jpg')}
                            disabled={!processedImage || isProcessing}
                        >
                            <Download className="w-4 h-4" />
                            <span>Export JPG</span>
                        </Button>
                        <Button
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                            onClick={() => handleExport('png')}
                            disabled={!processedImage || isProcessing}
                        >
                            <Download className="w-4 h-4" />
                            <span>Export PNG</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-80 bg-card border-l border-card-border p-4">
                <div className="space-y-4">

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-foreground">AI Tools</h3>
                        <div className="space-y-3">
                            {primaryTools.map((tool) => {
                                const IconComponent = tool.icon;
                                const isActive = activeTool === tool.id;

                                return (
                                    <motion.button
                                        key={tool.id}
                                        className={`w-full p-4 rounded-lg border transition-all text-left relative ${isProcessing
                                                ? 'cursor-not-allowed opacity-50'
                                                : 'cursor-pointer hover:scale-105'
                                            } ${isActive
                                                ? 'bg-primary/20 border-primary text-primary'
                                                : tool.color === 'primary'
                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                                                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30'
                                            }`}
                                        onClick={() => {
                                            if (isProcessing) return;
                                            tool.hasPrompt
                                                ? handleToolWithPrompt(tool.id)
                                                : handleToolClick(tool.id);
                                        }}
                                        whileHover={isProcessing ? {} : { scale: 1.02 }}
                                        whileTap={isProcessing ? {} : { scale: 0.98 }}
                                        disabled={isProcessing}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <IconComponent className="w-5 h-5" />
                                                <div>
                                                    <span className="font-medium block">{tool.name}</span>
                                                    <span className="text-xs opacity-70">{tool.description}</span>
                                                </div>
                                            </div>
                                            {isActive && (
                                                <Check className="w-4 h-4 text-green-400" />
                                            )}
                                        </div>
                                        {tool.hasPrompt && toolPrompts[tool.id] && isActive && (
                                            <div className="mt-2 text-xs opacity-70 truncate">
                                                Prompt: "{toolPrompts[tool.id]}"
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>

            <AnimatePresence>
                {showPromptInput && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">
                                    {primaryTools.find(t => t.id === showPromptInput)?.name}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowPromptInput(null)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {primaryTools.find(t => t.id === showPromptInput)?.description}
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium block mb-2">
                                        Enter your prompt:
                                    </label>
                                    <textarea
                                        value={promptValue}
                                        onChange={(e) => setPromptValue(e.target.value)}
                                        placeholder="Describe what you want to do..."
                                        className="w-full p-3 border border-card-border rounded-md bg-background resize-none"
                                        rows={3}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowPromptInput(null)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={applyToolWithPrompt}
                                        disabled={!promptValue.trim()}
                                        className="flex-1"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
