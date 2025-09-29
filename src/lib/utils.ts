import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const scrollToSection = (sectionId: string, setIsMobileMenuOpen?: (state: boolean) => void) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }
};