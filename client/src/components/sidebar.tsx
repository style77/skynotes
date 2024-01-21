import { Folder, FolderUp, Files, FolderHeart, MessageSquareShare, LogOut } from "lucide-react"
import { SidebarItem } from "./sidebarItem"

export function Sidebar() {
    return (
        <div className="flex flex-col justify-between bg-foreground h-full text-white">
            <div className="mt-5 w-full flex justify-center">
                <img src="/icons/logo-transparent.png" alt="SkyNotes logo" className="w-40" />
            </div>
            <div className="space-y-4 flex flex-col justify-center px-6">
                <SidebarItem name="My Cloud" icon={Folder} href="/dashboard" onClick={() => { }} />
                <SidebarItem name="Shared" icon={FolderUp} href="/dashboard/shared" onClick={() => { }} />
                <SidebarItem name="All Files" icon={Files} href="/dashboard/files" onClick={() => { }} />
                <SidebarItem name="Favourites" icon={FolderHeart} href="/dashboard/favourites" onClick={() => { }} />
            </div>
            <div className="space-y-4 mx-6 mb-12">
                <a className="inline-flex gap-3 w-full py-4 rounded-3xl">
                    <MessageSquareShare className="ml-5" />
                    <span>Help & Support</span>
                </a>
                <a className="inline-flex gap-3 w-full py-4 rounded-3xl">
                    <LogOut className="ml-5" />
                    <span>Log out</span>
                </a>
            </div>
        </div>
    )
}