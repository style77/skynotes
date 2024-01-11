import { Folder, FolderUp, Files, FolderHeart, FolderLock, Trash2, MessageSquareShare, LogOut } from "lucide-react"


export function Sidebar() {
        return (
            <div className="flex flex-col justify-between bg-foreground h-full w-80 text-white">
                <div className="mt-5 mx-6">
                    <h1 className="text-3xl font-medium">Skynotes</h1>
                </div>
                <div className="space-y-4 mx-6">
                    <a className="inline-flex gap-3 bg-primary w-full py-4 rounded-3xl">
                        <Folder className="ml-5"/>
                        <span>My Cloud</span>
                    </a>
                    <a className="inline-flex gap-3 w-full py-4 rounded-3xl">
                        <FolderUp className="ml-5"/>
                        <span>Shared</span>
                    </a>
                    <a className="inline-flex gap-3 w-full py-4 rounded-3xl">
                        <Files className="ml-5"/>
                        <span>All files</span>
                    </a>
                    <a className="inline-flex gap-3 w-full py-4 rounded-3xl">
                        <FolderHeart className="ml-5"/>
                        <span>Favourites</span>
                    </a>
                    <a className="inline-flex gap-3 w-full py-4 rounded-3xl">
                        <FolderLock className="ml-5"/>
                        <span>Private files</span>
                    </a>
                    <a className="inline-flex gap-3 w-full py-4 rounded-3xl">
                        <Trash2 className="ml-5"/>
                        <span>Deleted files</span>
                    </a>
                </div>
                <div className="space-y-4 mx-6 mb-12">
                    <a className="inline-flex gap-3 w-full py-4 rounded-3xl">
                        <MessageSquareShare className="ml-5"/>
                        <span>Help & Support</span>
                    </a>
                    <a className="inline-flex gap-3 w-full py-4 rounded-3xl">
                        <LogOut className="ml-5"/>
                        <span>Log out</span>
                    </a>
                </div>
            </div>
    )
}