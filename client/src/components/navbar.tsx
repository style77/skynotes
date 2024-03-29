import { useState } from "react";
import { UploadCloud, FolderPlus } from "lucide-react";
import { Button } from "./ui/button";
import { NewGroupModal } from "./group/groupModal";
import { useRetrieveUserQuery } from "@/store/features/authApiSlice";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import { humanFriendlySize } from "@/lib/utils";
import Spinner from "./ui/spinner";
import { NewFileModal } from "./file/fileModal";
import { useSearchParams } from "react-router-dom";

export function Navbar() {
    const { data: user, isLoading: userLoading, error: userError } = useRetrieveUserQuery()
    const [searchParams] = useSearchParams()
    const currentGroupId = searchParams.get("group")

    const [openCreateGroup, setOpenCreateGroup] = useState(false)
    const [openUploadFile, setOpenUploadFile] = useState(false)

    return (
        <div className="w-full h-16 flex flex-row justify-between px-8 items-center bg-white">
            <div className="flex flex-row gap-2">
                <Button className="flex flex-row items-center" onClick={() => setOpenUploadFile(true)}>
                    <div>
                        <UploadCloud />
                    </div>
                    <span className="ml-2 font-semibold">Upload</span>
                </Button>
                <Button className="bg-white text-black hover:text-white flex flex-row items-center" onClick={() => setOpenCreateGroup(true)}>
                    <div>
                        <FolderPlus />
                    </div>
                    <span className="ml-2 font-semibold">New Folder</span>
                </Button>
                <NewGroupModal open={openCreateGroup} setOpen={setOpenCreateGroup} />
                <NewFileModal open={openUploadFile} setOpen={setOpenUploadFile} currentGroupId={currentGroupId} />
            </div>
            {
                !user && (userLoading || userError) ? <Spinner /> : user && (
                    <div className="flex flex-row gap-4 items-center">
                        <div className="px-4 py-2 rounded-lg lg:block hidden">
                            <span className="text-sm font-semibold text-primary/75 hover:text-primary cursor-default">{humanFriendlySize(user.storage_used, "GB")} / {humanFriendlySize(user.storage_limit, "GB")}</span>
                        </div>
                        <div className="block lg:hidden">
                            <span className="text-sm font-semibold text-primary/75 hover:text-primary cursor-default">{humanFriendlySize(user.storage_used, "GB")}</span>
                        </div>
                        <div>
                            <Avatar>
                                <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                )
            }
        </div>
    )
}