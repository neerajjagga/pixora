import EditorCanvas from "@/components/studio/EditorCanvas";
import StudioMediaSidebar from "@/components/studio/StudioMediaSidebar/Index";

export default function Studio() {
    return (
        <div className="pt-21 min-h-screen w-full flex gap-4 pb-5 px-12">
            <StudioMediaSidebar />
            <EditorCanvas />
        </div>
    );
}