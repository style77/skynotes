import { UploadCloud, FolderPlus } from "lucide-react";
import { Button } from "./ui/button";
import { NewGroupModal } from "./group/newGroupModal";

export function Navbar() {
    return (
        <div className="w-full h-16 flex flex-row justify-between px-8 items-center bg-white">
            <div className="flex flex-row gap-2">
                <Button className="flex flex-row items-center">
                    <div>
                        <UploadCloud />
                    </div>
                    <span className="ml-2 font-semibold">Upload</span>
                </Button>
                <NewGroupModal />
            </div>
            <div className="flex flex-row gap-4">
                <div></div>
                <div className="gap-2"></div>
            </div>
        </div>
    )
}