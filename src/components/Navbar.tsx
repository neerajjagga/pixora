"use client"

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from 'motion/react';
import { scrollToSection } from "@/lib/utils";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const { data: session } = useSession();

    const handleSubmit = async () => {
        if (session?.user) {
            scrollToSection("editor", setIsMobileMenuOpen);
        } else {
            await signIn("google");
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all backdrop-blur-sm duration-300 ${isScrolled
                ? "glass border-b border-card-border backdrop-blur-glass"
                : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center space-x-2 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => scrollToSection("hero")}
                    >
                        <div className="relative">
                            <Sparkles
                                fill="transparent"
                                className="h-8 w-8 text-primary animate-glow-pulse"
                            />
                            <div className="absolute inset-0 h-8 w-8 text-secondary animate-glow-pulse opacity-50" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-primary !bg-clip-text text-transparent">
                            Pixora
                        </span>
                    </motion.div>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => scrollToSection("features")}
                            className="text-foreground hover:text-primary transition-colors font-medium"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection("pricing")}
                            className="text-foreground hover:text-primary transition-colors font-medium"
                        >
                            Pricing
                        </button>
                        <Button
                            variant="hero"
                            className="font-semibold"
                            onClick={handleSubmit}
                        >
                            {session?.user ? "Launch App" : "Sign In"}
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                <motion.div
                    initial={false}
                    animate={{
                        height: isMobileMenuOpen ? "auto" : 0,
                        opacity: isMobileMenuOpen ? 1 : 0,
                    }}
                    className="md:hidden overflow-hidden backdrop-blur-sm"
                >
                    <div className="py-4 space-y-4">
                        <button
                            onClick={() => scrollToSection("features")}
                            className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection("pricing")}
                            className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium"
                        >
                            Pricing
                        </button>
                        <Button variant="hero" className="w-full" onClick={handleSubmit}>
                            {session?.user ? "Launch App" : "Sign In"}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </motion.nav>
    );
}