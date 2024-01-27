import { UploadCloud } from "lucide-react";
import { Button } from "./ui/button";
import { NewGroupModal } from "./group/groupModal";
import { useRetrieveUserQuery } from "@/store/features/authApiSlice";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import { humanFriendlySize } from "@/lib/utils";
import Spinner from "./ui/spinner";

export function Navbar() {
    const { data: user, isLoading: userLoading, error: userError } = useRetrieveUserQuery()

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
            {
                !user && (userLoading || userError) ? <Spinner /> : user && (
                    <div className="flex flex-row gap-4 items-center">
                        <div className="border border-gray-200/50 px-4 py-2 rounded-3xl">
                            <span className="text-sm font-semibold text-primary">{humanFriendlySize(user.storage_used, "GB")} / {humanFriendlySize(user.storage_limit, "GB")}</span>
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