"use client"

import { signIn, useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Coins, Crown, Menu, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from 'motion/react';
import { scrollToSection } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
    const router = useRouter();
    
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const { data: session } = useSession();
    const user = session?.user;

    const handleSubmit = async () => {
        if (user) {
            router.push('/studio')
        } else {
            await signIn("google");
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all backdrop-blur-sm duration-300 py-2 ${isScrolled
                ? "glass border-b border-card-border backdrop-blur-glass"
                : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href={'/'}>
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
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => router.push('/pricing')}
                            className="text-foreground hover:text-primary transition-colors font-medium"
                        >
                            Pricing
                        </button>

                        <div className="flex items-center gap-2">
                            {user && (
                                <Button
                                    variant='secondary'
                                    className="font-semibold relative"
                                >
                                    <Coins />
                                    Credits
                                    <span className="py-1 px-4 text-xs bg-black rounded-full text-white font-bold">{user.usageLimit - user.usageCount}</span>
                                </Button>
                            )}
                            <Button
                                variant="hero"
                                className="font-semibold relative"
                                onClick={handleSubmit}
                            >
                                {user ? "Studio" : "Sign In"}

                                {user?.plan === "PAID" && (
                                    <span className="absolute -top-2 -right-1 rotate-20">
                                        <Crown className="text-amber-500 stroke-3" />
                                    </span>
                                )}
                            </Button>

                            {user && (
                                <Button
                                    variant={'destructive'}
                                    className="font-semibold"
                                    onClick={async () => await signOut()}
                                >
                                    Logout
                                </Button>
                            )}
                        </div>
                    </div>

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
                            onClick={() => scrollToSection("pricing")}
                            className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium"
                        >
                            Pricing
                        </button>
                        {user && (
                            <Button
                                variant='secondary'
                                className="w-full font-semibold relative"
                            >
                                <Coins />
                                Credits
                                <span className="py-1 px-4 text-xs bg-black rounded-full text-white font-bold">{user.usageLimit - user.usageCount}</span>
                            </Button>
                        )}
                        <Button variant="hero" className="w-full" onClick={handleSubmit}>
                            {user ? "Studio" : "Sign In"}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </motion.nav>
    );
}