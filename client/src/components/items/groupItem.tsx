import { humanFriendlySize } from "@/lib/utils";
import { Group, useDeleteGroupMutation } from "@/store/features/groupsApiSlice";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Folder, Music, Video, Files, Archive, MoreVertical, Image } from "lucide-react";
import { useState } from "react";
import { EditGroupModal } from "../group/groupModal";

type GroupItemProps = {
  id: string;
  name: string;
  files: number;
  icon: string;
  size: number;
  description: string;
  onClick?: () => void;
}

export function GroupItem(props: GroupItemProps) {
  const [deleteGroup] = useDeleteGroupMutation()

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  let groupSize = humanFriendlySize(props.size);
  if (groupSize === "0 B") {
    groupSize = "0 files"
  }

  const getIcon = (icon: string) => {
    switch (icon) {
      case "default":
        return <Folder width={40} height={40} />
      case "music":
        return <Music width={40} height={40} />
      case "video":
        return <Video width={40} height={40} />
      case "photo":
        return <Image width={40} height={40} />
      case "document":
        return <Files width={40} height={40} />
      case "archive":
        return <Archive width={40} height={40} />
      default:
        return <Folder width={40} height={40} />
    }
  }

  const handleDelete = async () => {
    await deleteGroup({ id: props.id }).unwrap();
    setDeleteOpen(false);
  }

  return (
    <>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the <code>{props.name}</code> group
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <EditGroupModal group={{
        id: props.id,
        name: props.name,
        description: props.description,
        icon: props.icon,
      } as Group} open={editOpen} setOpen={setEditOpen} />
      <DropdownMenu>
        <div className="flex flex-col items-center h-56 w-full md:w-56 cursor-pointer shadow-lg" onClick={props.onClick}>
          <div className="flex flex-col bg-white hover:bg-gray-50 transition h-full p-4 gap-2 rounded-t-lg w-full">
            <div className="flex flex-row justify-between items-center">
              {getIcon(props.icon)}
              <DropdownMenuTrigger className="p-1 hover:bg-gray-300/25 rounded-full transition inline-flex justify-center items-center z-10">
                <MoreVertical className="text-gray-600" />
              </DropdownMenuTrigger>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold truncate">{props.name}</span>
              <span className="opacity-50 truncate text-xs">{props.description || "No description..."}</span>
            </div>
            <span className="opacity-50 text-sm">{props.files} files</span>
          </div>
          <div className="bg-primary text-white rounded-b-lg w-full flex flex-row py-4 px-4">
            <span className="text-xs font-semibold">{groupSize}</span>
            <span className="text-sm"></span>
          </div>
        </div>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500" onClick={() => setDeleteOpen(true)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}