
import { Download, Link, MoreHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { setContextMenuFunctionality, setShowYScroll } from "@/store/features/interfaceSlice";
import { useAppDispatch } from "@/store/hooks";
import { AudioViewer } from "./audioViewer";
import { ImageViewer } from "./imageViewer";
import { FileShareModal } from "../file/fileShareModal";
import { StorageFile } from "@/types/filesTypes";
import { EditFileModal } from "../file/fileModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import FileDeleteModal from "../file/fileDeleteModal";
import { VideoViewer } from "./videoViewer";


export type ViewerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  file: StorageFile;
  setFocusedFile: (id: string | null) => void;
}

export function Viewer(props: ViewerProps) {
  const extension = props.file.name.split('.').pop();

  switch (extension) {
    // case 'pdf':
    //   return <PdfViewer {...props} />
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <ImageViewer {...props} />
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'wmv':
    case 'flv':
    case 'mkv':
      return <VideoViewer {...props} />
    case 'mp3':
    case 'wav':
    case 'aac':
    case 'ogg':
    case 'flac':
      return <AudioViewer {...props} />
    default:
      return <></>
    // return <DefaultViewer {...props} />
  }
}

type BaseViewerProps = {
  children: React.ReactNode;
} & ViewerProps

export function BaseViewer(props: BaseViewerProps) {
  const dispatch = useAppDispatch();
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (props.open) {
      dispatch(setShowYScroll(false));
      dispatch(setContextMenuFunctionality(false))
    } else {
      dispatch(setShowYScroll(true));
      dispatch(setContextMenuFunctionality(true))
    }
  }, [props.open, dispatch]);

  const handleClose = () => {
    props.setOpen(false);
    props.setFocusedFile(null);
    dispatch(setShowYScroll(true));
    dispatch(setContextMenuFunctionality(true))
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${props.file.file}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = props.file.name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to fetch file:', e);
    }
  }

  return (
    <>
      <FileDeleteModal file={props.file} deleteOpen={deleteOpen} setDeleteOpen={setDeleteOpen} fileUploadingDeleteOpen={false} setFileUploadingDeleteOpen={() => {}} />
      <EditFileModal open={editOpen} setOpen={setEditOpen} file={props.file} />
      <FileShareModal open={shareOpen} setOpen={setShareOpen} fileId={props.file.id} fileName={props.file.name} wrapped={true} />
      <div className={`fixed inset-0 z-40 bg-black text-white justify-between items-center p-4 flex-col h-full w-full ${props.open ? "flex" : "hidden"}`}>
        <div className="w-full justify-between flex flex-row items-center">
          <div className="flex flex-row gap-6">
            <Download className="text-gray-300 hover:text-white cursor-pointer" size={22} onClick={handleDownload} />
            <Link className="text-gray-300 hover:text-white cursor-pointer" size={22} onClick={() => setShareOpen(true)} />
            <span className="sr-only">Open menu</span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreHorizontal className="text-gray-300 hover:text-white cursor-pointer" size={22} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={() => setDeleteOpen(true)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="font-regular text-white/90 select-none mr-[4.5rem] z-[999]">{props.file.name}</div>
          <X className="text-gray-300 hover:text-white cursor-pointer" size={24} onClick={handleClose} />
        </div>
        {props.children}
      </div>
    </>
  )
}