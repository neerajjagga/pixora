"use client";

import { Loader as LoaderIcon } from "lucide-react";

export default function Loader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
            <LoaderIcon className="animate-spin text-white" size={30} />
        </div>
    );
}
