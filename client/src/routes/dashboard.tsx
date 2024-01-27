import { Navbar } from "@/components/navbar"
import { File, useDeleteFileMutation, useRetrieveRootFilesQuery } from "@/store/features/filesApiSlice";
import { Group, useDeleteGroupMutation, useRetrieveGroupsQuery } from "@/store/features/groupsApiSlice";
import { useState, useEffect } from "react";
import { format, parseISO } from 'date-fns';
import { Folder, MoreVertical, Image, Music, Video, Files, Archive, ArrowUpZA, ArrowDownZA, ArrowUp10, ArrowDown10, ArrowUpWideNarrow, ArrowDownWideNarrow } from "lucide-react";
// import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditGroupModal } from "@/components/group/groupModal";

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
    await deleteGroup(props.id).unwrap();
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
        <div className="flex flex-col items-center h-56 w-56 cursor-pointer">
          <div className="flex flex-col bg-white hover:bg-gray-50 transition h-full p-4 gap-2 rounded-t-xl w-full">
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
          <div className="bg-primary text-white rounded-b-xl w-full flex flex-row py-4 px-4">
            <span className="text-xs font-semibold">{groupSize}</span>
            <span className="text-sm"></span>
          </div>
        </div>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Share settings</DropdownMenuItem>
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
    <div className="w-full select-none bg-black rounded-t-xl">
      {
        thumbnailUrl ? (
          <div className="relative rounded-t-xl h-24 w-full">
            <img src={thumbnailUrl} alt={`Thumbnail for media ID ${mediaUrl}`} className="rounded-t-xl h-24 w-full select-none" />
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-t-xl bg-gradient-to-b from-black/40 to-black/75"></div>
          </div>
        ) : (
          <div className="w-full h-24 bg-gray-300 rounded-t-xl animate-pulse"></div>
        )
      }
    </div>
  );
};

export function FileItem(props: FileItemProps) {
  const formattedDate = format(parseISO(props.createdAt), 'dd/MM/yyyy, hh:mm a');

  const [deleteFile] = useDeleteFileMutation()

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    await deleteFile({ id: props.id }).unwrap()
    setDeleteOpen(false);
  }

  return (
    <>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the <code>{props.name}</code> file
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <div className={`flex flex-col items-center w-56 h-56 hover:ring-2 hover:ring-primary/50 rounded-xl cursor-pointer transition-all` + (props.focused && " ring-primary ring-2")} onClick={props.onClick}>
          <div className="flex flex-col bg-white h-full gap-1 rounded-t-xl w-full">
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
          <div className="bg-primary text-white rounded-b-xl w-full flex flex-row py-4 px-4">
            <span className="text-xs font-semibold">{humanFriendlySize(props.size)}</span>
          </div>
        </div>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Share settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500" onClick={() => setDeleteOpen(true)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
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
  return (
    <div className="flex flex-wrap gap-3">
      {props.groups && props.groups.map((group) => (
        <GroupItem
          key={group.id}
          id={group.id}
          name={group.name}
          files={group.files}
          icon={group.icon}
          size={group.size}
          description={group.description}
        />
      ))}
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
            props.setFocusedFile(props.focusedFile === file.id ? null : file.id);
          }}
          focused={file.id === props.focusedFile}
        />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { data: groups, error: groupsError, isLoading: groupsIsLoading } = useRetrieveGroupsQuery();
  const { data: files, error: filesError, isLoading: filesIsLoading } = useRetrieveRootFilesQuery();

  const [focusedFile, setFocusedFile] = useState<string | null>(null);

  const [sortOption] = useState<string>("name");
  const [sortDirection] = useState<string>("asc");

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
      <div className="px-12 py-8">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-2xl">My Cloud</h2>
          <div className="flex flex-row space-between items-center opacity-50 text-sm">
            <span>Sort by:</span>
            <div className="flex flex-row ml-1 items-center gap-1">
              <span className="font-bold capitalize">{sortOption}</span>
              {getSortDirectionIcon(sortDirection)}
            </div>
          </div>
          {
            groupsIsLoading || filesIsLoading ? (
              <div className="flex flex-wrap gap-3">
                {
                  Array.from(Array(10).keys()).map((_, index) => (
                    <div className="animate-pulse flex flex-col items-center h-56 w-56" key={index}>
                      <div className="flex flex-col bg-white h-full p-4 gap-1 rounded-t-xl w-full">
                        <div className="bg-[#f0f0f0] rounded-t-xl h-24 w-full"></div>
                        <div className="mt-1 px-3 flex flex-col">
                          <div className="font-semibold text-xs sm:text-xs md:text-base bg-[#f0f0f0] rounded h-4 w-1/2"></div>
                          <div className="opacity-50 text-xs bg-[#f0f0f0] rounded h-4 w-1/4"></div>
                        </div>
                      </div>
                      <div className="bg-[#f0f0f0] rounded-b-xl w-full flex flex-row py-4 px-3">
                        <div className="text-sm font-semibold bg-[#f0f0f0] rounded h-4 w-1/4"></div>
                        <div className="text-sm bg-[#f0f0f0] rounded h-4 w-1/4"></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : groupsError ? (
              <>
                {groupsError}
              </>
            ) : filesError ? (
              <>
                {filesError}
              </>
            ) : (
              <ItemsGrid groups={groups} files={files} setFocusedFile={setFocusedFile} focusedFile={focusedFile} />
            )
          }
        </div>
      </div>
    </div>
    // {/* </ResizablePanel> */ }
    // {/* </ResizablePanelGroup> */ }
  )
}