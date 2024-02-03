import { Navbar } from "@/components/navbar"
import { useRetrieveFilesQuery } from "@/store/features/filesApiSlice";
import { useRetrieveGroupsQuery } from "@/store/features/groupsApiSlice";
import { useState } from "react";
import { ArrowUpZA, ArrowDownZA, ArrowUp10, ArrowDown10, ArrowUpWideNarrow, ArrowDownWideNarrow, ChevronLeft, Menu } from "lucide-react";
import { NewGroupModal } from "@/components/group/groupModal";

import { getOS } from "@/lib/utils";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuTrigger, ContextMenuLabel, ContextMenuSeparator } from "@/components/ui/context-menu";
import { useSearchParams } from "react-router-dom";
import { NewFileModal } from "@/components/file/fileModal";
import { useAppSelector } from "@/store/hooks";

import { ItemsGrid } from "@/components/items/itemsGrid";

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
    <div className="min-h-screen w-full flex flex-col bg-[#EAEAEA]">
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
  )
}