import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { File, useRetrieveRootFilesQuery } from "@/store/features/filesApiSlice";
import { Group, useRetrieveGroupsQuery } from "@/store/features/groupsApiSlice";
import { useState, useEffect } from "react";
import { format, parseISO } from 'date-fns';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Folder, MoreVertical } from "lucide-react";
// import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditGroupModal } from "@/components/group/groupModal";

type FileItemProps = {
  id: string;
  name: string;
  file: string;
  createdAt: string;
  onClick?: () => void;
  focused?: boolean;
}

type GroupItemProps = {
  id: string;
  name: string;
  files: number;
  icon: string;
  description: string;
}

export function GroupItem(props: GroupItemProps) {
  // const navigate = useNavigate();

  const handleClick = () => {
    console.log(123)
  }

  return (
    <DropdownMenu>
      <div className="flex flex-col items-center h-56 w-56 cursor-pointer" onClick={handleClick}>
        <div className="flex flex-col bg-white hover:bg-gray-50 transition h-full p-4 gap-1 rounded-t-xl w-full">
          <div className="flex flex-row justify-between items-center">
            <Folder width={40} height={40} />
            <DropdownMenuTrigger className="p-1 hover:bg-gray-300/25 rounded-full transition inline-flex justify-center items-center z-10">
              <MoreVertical className="text-gray-600" />
            </DropdownMenuTrigger>
          </div>
          <span className="font-semibold truncate">{props.name}</span>
          <span className="opacity-50 text-xs">{props.files} files</span>
        </div>
        <div className="bg-[#f0f0f0] rounded-b-xl w-full flex flex-row py-4 px-6">
          <span className="text-sm font-semibold">21.5 Mb</span>
          <span className="text-sm"></span>
        </div>
      </div>
      <DropdownMenuContent>
        <EditGroupModal group={{
          id: props.id,
          name: props.name,
          description: props.description,
          icon: props.icon,
        } as Group} />
        <DropdownMenuItem>Share</DropdownMenuItem>
        <DropdownMenuItem>Share settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ThumbnailProps {
  mediaUrl: string;
}

// const defaultThumbnailsMap: Record<string, string> = {
// }

const Thumbnail: React.FC<ThumbnailProps> = ({ mediaUrl }) => {

  const [thumbnailUrl, setThumbnailUrl] = useState<string>("https://cdn-icons-png.flaticon.com/512/906/906794.png");

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
      }
    }

    fetchThumbnail();

  }, [mediaUrl]);

  return (
    <div className="w-full select-none">
      {<img src={thumbnailUrl} alt={`Thumbnail for media ID ${mediaUrl}`} className="rounded-t-xl h-24 w-full select-none" />}
      {/* {!thumbnailUrl && <p>No thumbnail available</p>} */}
    </div>
  );
};

export function FileItem(props: FileItemProps) {
  const formattedDate = format(parseISO(props.createdAt), 'dd/MM/yyyy, hh:mm a');

  return (
    <div className={`flex flex-col items-center w-56 hover:ring-2 hover:ring-primary/50 rounded-xl transition-all` + (props.focused && " ring-primary ring-2")} onClick={props.onClick}>
      <div className="flex flex-col bg-white h-full gap-1 rounded-t-xl w-full">
        <Thumbnail mediaUrl={props.file} />
        <div className="mt-1 px-3 flex flex-col">
          <span className="font-semibold text-xs sm:text-xs md:text-base">{props.name}</span>
          <span className="opacity-50 text-xs">{formattedDate}</span>
        </div>
      </div>
      <div className="bg-[#f0f0f0] rounded-b-xl w-full flex flex-row py-4 px-3">
        <span className="text-sm font-semibold">21.5 Mb</span>
        <span className="text-sm"></span>
      </div>
    </div>
  )
}

type ItemsGridProps = {
  groups: Group[] | undefined;
  files: File[] | undefined;
  setFocusedFile: (id: string) => void;
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
          description={group.description}
        />
      ))}
      {props.files && props.files.map((file) => (
        <FileItem
          key={file.id}
          id={file.id}
          file={file.file}
          name={file.name}
          createdAt={file.created_at}
          onClick={() => {
            props.setFocusedFile(file.id);
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
          <div className="flex flex-row space-between">
            <span className="opacity-50 text-sm">Sort by: </span>
          </div>
          {
            groupsIsLoading || filesIsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {
                  Array.from(Array(10).keys()).map((_, index) => (
                    <div className="animate-pulse flex flex-col items-center h-56 w-full" key={index}>
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