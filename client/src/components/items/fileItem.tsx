import { useDeleteFileMutation } from "@/store/features/filesApiSlice";
import { useState, useEffect } from "react";
import { format, parseISO } from 'date-fns';
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { humanFriendlySize } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { apiSlice } from "@/store/services/apiSlice";

import { Thumbnail } from "@/components/items/thumbnail";
import { BouncingDotsLoader } from "../ui/bouncing-dots";

type FileItemProps = {
  id: string;
  name: string;
  file: string;
  thumbnail: string | null;
  size: number;
  tags: string[];
  createdAt: string;
  onClick?: () => void;
  focused?: boolean;
}

export function FileItem(props: FileItemProps) {
  const formattedDate = format(parseISO(props.createdAt), 'dd/MM/yyyy, hh:mm a');

  const [deleteFile] = useDeleteFileMutation()

  // @ts-expect-error TODO: Implement edit file
  const [editOpen, setEditOpen] = useState(false);  // eslint-disable-line
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [fileUploadingDeleteOpen, setFileUploadingDeleteOpen] = useState(false);

  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (props.file) {
      setFileUploaded(true);
    } else {
      setFileUploaded(false);

      intervalId = setInterval(() => {
        dispatch(apiSlice.util.invalidateTags(['File']));
      }, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [props.file, dispatch]);

  const handleDelete = async () => {
    await deleteFile({ id: props.id }).unwrap()
    setDeleteOpen(false);
    setFileUploadingDeleteOpen(false)
  }

  return (
    <>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {
                fileUploadingDeleteOpen ? (
                  <>
                    You are currently <b>uploading this file</b>. Deleting it will cancel the upload. If you think file upload is taking too long, please check your internet connection or report the issue to us.
                  </>
                ) : (
                  <>
                    This action cannot be undone. This will permanently delete the <code>{props.name}</code> file
                    and remove your data from our servers.
                  </>
                )
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        {
          fileUploaded ? (
            <>
              <div className={`flex flex-col items-center w-full md:w-56 h-56 max-h-56 hover:ring-2 hover:ring-primary/50 rounded-lg cursor-pointer shadow-lg transition-all` + (props.focused && " ring-primary ring-2")} onClick={props.onClick}>
                <div className="flex flex-col bg-white h-full gap-1 rounded-t-lg w-full">
                  <div className="relative">
                    <Thumbnail fileName={props.name} mediaUrl={props.thumbnail} />
                    <DropdownMenuTrigger className={`p-1 ${props.thumbnail ? "hover:bg-gray-100/25" : "hover:bg-gray-300/25"} rounded-full transition inline-flex justify-center items-center z-10 absolute top-3 right-3`}>
                      <MoreVertical className={props.thumbnail ? "text-gray-50" : "text-gray-600"} />
                    </DropdownMenuTrigger>
                  </div>
                  <div className="mt-1 px-3 flex flex-col">
                    <span className="font-semibold text-xs sm:text-xs md:text-base truncate text-wrap">{props.name}</span>
                    <span className="opacity-50 text-xs">{formattedDate}</span>
                  </div>
                </div>
                <div className="bg-primary text-white rounded-b-lg w-full flex flex-row py-4 px-4">
                  <span className="text-xs font-semibold">{humanFriendlySize(props.size)}</span>
                </div>
              </div>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={() => setDeleteOpen(true)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </>
          ) : (
            <>
              <div className="relative flex flex-col items-center md:w-56 h-56 max-h-56 rounded-lg cursor-disabled shadow-lg transition-all">
                <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg z-50 animate-pulse flex items-center justify-center">
                  <BouncingDotsLoader dotsColor="bg-gray-400" />
                </div>
                <div className="flex flex-col bg-white h-full gap-1 rounded-t-lg w-full">
                  <div className="relative">
                    <div className="w-full h-24 bg-gray-300 rounded-t-lg animate-pulse"></div>
                    <div>
                      <DropdownMenuTrigger className="p-1 hover:bg-gray-100/25 rounded-full transition inline-flex justify-center items-center z-[100] absolute top-3 right-3">
                        <MoreVertical className="text-gray-50" />
                      </DropdownMenuTrigger>
                    </div>
                  </div>
                  <div className="mt-1 px-3 flex flex-col">
                    <span className="font-semibold text-xs sm:text-xs md:text-base">{props.name}</span>
                    <span className="opacity-50 text-xs">{formattedDate}</span>
                  </div>
                </div>
                <div className="bg-primary text-white rounded-b-lg w-full flex flex-row py-4 px-4">
                  <span className="text-xs font-semibold">{props.size && humanFriendlySize(props.size)}</span>
                </div>
              </div>
              <DropdownMenuContent className="z-[100]">
                <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                <DropdownMenuItem disabled>Share</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={() => { setDeleteOpen(true); setFileUploadingDeleteOpen(true) }}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </>
          )
        }
      </DropdownMenu>
    </>
  )
}