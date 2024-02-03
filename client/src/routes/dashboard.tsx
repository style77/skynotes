import { Navbar } from "@/components/navbar"
import { File, useDeleteFileMutation, useRetrieveFilesQuery } from "@/store/features/filesApiSlice";
import { Group, useDeleteGroupMutation, useRetrieveGroupsQuery } from "@/store/features/groupsApiSlice";
import { useState, useEffect } from "react";
import { format, parseISO } from 'date-fns';
import { Folder, MoreVertical, Image, Music, Video, Files, Archive, ArrowUpZA, ArrowDownZA, ArrowUp10, ArrowDown10, ArrowUpWideNarrow, ArrowDownWideNarrow, ChevronLeft, Menu } from "lucide-react";
// import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditGroupModal, NewGroupModal } from "@/components/group/groupModal";

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
import { getOS, humanFriendlySize } from "@/lib/utils";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuTrigger, ContextMenuLabel, ContextMenuSeparator } from "@/components/ui/context-menu";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "@/components/ui/spinner";
import { NewFileModal } from "@/components/file/fileModal";
import { Viewer } from "@/components/viewers/baseViewer";
import { useDispatch } from "react-redux";
import { apiSlice } from "@/store/services/apiSlice";
import { useAppSelector } from "@/store/hooks";

type FileItemProps = {
  id: string;
  name: string;
  file: string;
  size: number;
  tags: string[];
  createdAt: string;
  onClick?: () => void;
  focused?: boolean;
}

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

interface ThumbnailProps {
  mediaUrl: string;
}

// const defaultThumbnailsMap: Record<string, string> = {
// }

const Thumbnail: React.FC<ThumbnailProps> = ({ mediaUrl }) => {

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchThumbnail = async () => {
      const url = `http://localhost:8000${mediaUrl}?thumbnail=true`
      try {
        await fetch(url, {
          credentials: 'include',
        });
        setThumbnailUrl(url);
      } catch (e) {
        console.error(e);
        setThumbnailUrl(null)
      }
    }

    fetchThumbnail();
  }, [mediaUrl]);

  return (
    <div className="w-full select-none bg-black rounded-t-lg">
      {
        thumbnailUrl ? (
          <div className="relative rounded-t-lg h-24 w-full">
            <img src={thumbnailUrl} alt={`Thumbnail for media ID ${mediaUrl}`} className="rounded-t-lg h-24 w-full select-none" />
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-t-lg bg-gradient-to-b from-black/40 to-black/75"></div>
          </div>
        ) : (
          <div className="w-full h-24 bg-gray-300 rounded-t-lg animate-pulse"></div>
        )
      }
    </div>
  );
};

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
              <div className={`flex flex-col items-center w-full md:w-56 h-56 hover:ring-2 hover:ring-primary/50 rounded-lg cursor-pointer shadow-lg transition-all` + (props.focused && " ring-primary ring-2")} onClick={props.onClick}>
                <div className="flex flex-col bg-white h-full gap-1 rounded-t-lg w-full">
                  <div className="relative">
                    <Thumbnail mediaUrl={props.file} />
                    <DropdownMenuTrigger className="p-1 hover:bg-gray-100/25 rounded-full transition inline-flex justify-center items-center z-10 absolute top-3 right-3">
                      <MoreVertical className="text-gray-50" />
                    </DropdownMenuTrigger>
                  </div>
                  <div className="mt-1 px-3 flex flex-col">
                    <span className="font-semibold text-xs sm:text-xs md:text-base">{props.name}</span>
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
              <div className="relative flex flex-col items-center w-56 h-56 rounded-lg cursor-disabled shadow-lg transition-all">
                <div className="absolute inset-0 bg-black bg-opacity-75 rounded-lg z-50 animate-pulse flex items-center justify-center">
                  <Spinner className="text-white" />
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

type ItemsGridProps = {
  groups: Group[] | undefined;
  files: File[] | undefined;
  setFocusedFile: (id: string | null) => void;
  focusedFile: string | null;
}

function ItemsGrid(props: ItemsGridProps) {
  const navigate = useNavigate()

  const [viewFile, setViewFile] = useState<boolean>(false);

  const handleFileClick = (file: File) => {
    props.setFocusedFile(props.focusedFile === file.id ? null : file.id)
    setViewFile(true);
  }

  return (
    <div className="flex flex-wrap gap-8 md:gap-3">
      {props.groups && props.groups.map((group) => (
        <GroupItem
          key={group.id}
          id={group.id}
          name={group.name}
          files={group.files}
          icon={group.icon}
          size={group.size}
          description={group.description}
          onClick={() => navigate(`/dashboard?group=${group.id}`)}
        />
      ))}
      {
        (props.focusedFile && props.files) && (
          <Viewer open={viewFile} setOpen={setViewFile} file={props.files.filter((val) => val.id === props.focusedFile)[0]!} setFocusedFile={props.setFocusedFile} />
        )
      }
      {props.files && props.files.map((file) => (
        <FileItem
          key={file.id}
          id={file.id}
          file={file.file}
          name={file.name}
          size={file.size}
          tags={file.tags}
          createdAt={file.created_at}
          onClick={() => {
            handleFileClick(file)
          }}
          focused={file.id === props.focusedFile}
        />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const groupId = searchParams.get("group");

  const { contextMenuFunctionality } = useAppSelector(
    (state) => state.interface,
  );

  const { data: groups, error: groupsError, isLoading: groupsAreLoading } = useRetrieveGroupsQuery();
  const { data: files, error: filesError, isLoading: filesAreLoading } = useRetrieveFilesQuery({ groupId });

  const currentGroup = groups?.find((group) => group.id === groupId);

  const [focusedFile, setFocusedFile] = useState<string | null>(null);

  const [sortOption] = useState<string>("name");
  const [sortDirection] = useState<string>("asc");

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [uploadFileOpen, setUploadFileOpen] = useState(false);

  const getSortDirectionIcon = (sortDirection: string) => {
    switch (sortOption) {
      case "name":
        return sortDirection === "asc" ? <ArrowUpZA /> : <ArrowDownZA />;
      case "size":
        return sortDirection === "asc" ? <ArrowUp10 /> : <ArrowDown10 />;
      case "date":
        return sortDirection === "asc" ? <ArrowUpWideNarrow /> : <ArrowDownWideNarrow />;
      default:
        return sortDirection === "asc" ? <ArrowUpWideNarrow /> : <ArrowDownWideNarrow />;
    }
  }

  return (
    // <ResizablePanelGroup direction="horizontal" className="min-h-screen flex flex-col md:flex-row justify-center bg-[#EAEAEA]">
    <div className="min-h-screen w-full flex flex-col bg-[#EAEAEA]">
      {/* <ResizablePanel defaultSize={15} minSize={10} maxSize={20} className="flex">
        <Sidebar />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={85} minSize={85} maxSize={90} className="w-full flex flex-col"> */}
      <Navbar />
      <NewGroupModal open={createGroupOpen} setOpen={setCreateGroupOpen} />
      <NewFileModal open={uploadFileOpen} setOpen={setUploadFileOpen} currentGroupId={groupId} />

      <ContextMenu>
        <ContextMenuTrigger className="px-12 py-8 min-h-screen" disabled={!contextMenuFunctionality}>
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl flex flex-row items-center">
              {
                (groupId && currentGroup) ? (
                  <>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition mt-1" onClick={() => setSearchParams(undefined)}>
                      <ChevronLeft width={20} />
                    </button>
                    {
                      currentGroup.name
                    }
                  </>
                ) : (
                  <>
                    My Cloud
                  </>
                )
              }

            </h2>
            <div className="flex flex-row space-between items-center opacity-50 text-sm">
              <span>Sort by:</span>
              <div className="flex flex-row ml-1 items-center gap-1">
                <span className="font-bold capitalize">{sortOption}</span>
                {getSortDirectionIcon(sortDirection)}
              </div>
            </div>
            {
              groupsAreLoading || filesAreLoading ? (
                <div className="flex flex-wrap gap-3">
                  {
                    Array.from(Array(10).keys()).map((_, index) => (
                      <div className="animate-pulse flex flex-col items-center h-56 w-56" key={index}>
                        <div className="flex flex-col bg-white h-full p-4 gap-1 rounded-t-lg w-full">
                          <div className="bg-[#f0f0f0] rounded-t-lg h-24 w-full"></div>
                          <div className="mt-1 px-3 flex flex-col">
                            <div className="font-semibold text-xs sm:text-xs md:text-base bg-[#f0f0f0] rounded-lg h-4 w-1/2"></div>
                            <div className="opacity-50 text-xs bg-[#f0f0f0] rounded-lg h-4 w-1/4"></div>
                          </div>
                        </div>
                        <div className="bg-[#f0f0f0] rounded-b-lg w-full flex flex-row py-4 px-3">
                          <div className="text-sm font-semibold bg-[#f0f0f0] rounded-lg h-4 w-1/4"></div>
                          <div className="text-sm bg-[#f0f0f0] rounded-lg h-4 w-1/4"></div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : groupsError ? (
                <>
                  {/* @ts-expect-error Serialized error */}
                  {groupsError.error}
                </>
              ) : filesError ? (
                <>
                  {/* @ts-expect-error Serialized error */}
                  {filesError.error}
                </>
              ) : (
                <ItemsGrid groups={groupId ? undefined : groups} files={files} setFocusedFile={setFocusedFile} focusedFile={focusedFile} />
              )
            }
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuLabel className="flex flex-row gap-1 items-center">
            <Menu width={16} />Skynotes Menu
          </ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setUploadFileOpen(true)}>
            Upload File
            <ContextMenuShortcut>{getOS() === "Mac" ? "⌘⇧N" : <><kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>n</kbd></>}</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setCreateGroupOpen(true)}>
            New Folder
            <ContextMenuShortcut>{getOS() === "Mac" ? "⌘⇧N" : <><kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>g</kbd></>}</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
    // {/* </ResizablePanel> */ }
    // {/* </ResizablePanelGroup> */ }
  )
}