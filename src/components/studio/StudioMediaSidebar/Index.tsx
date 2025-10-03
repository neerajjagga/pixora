import Image from "next/image";
import UploadMediaButton from "./UploadMediaButton";
import { getUserMedia } from "@/actions/media";

export default async function StudioMediaSidebar() {
    const media = await getUserMedia();

    return (
        <div className="w-110 h-[89vh] bg-secondary/5 rounded-md flex flex-col gap-2 p-3 border-2 border-gradient-primary">
            <div>
                <UploadMediaButton />
            </div>

            {media.length === 0 && (
                <div className="h-full w-full flex justify-center items-center">
                    <h1>No media found</h1>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-6 overflow-y-auto">
                {media.map((img) => {
                    return (
                        <div key={img.id} className="relative w-full h-60 cursor-pointer">
                            <Image
                                src={img.url}
                                alt="User media"
                                fill
                                className="rounded-xl object-cover" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}