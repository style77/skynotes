import { Group } from "@/store/features/groupsApiSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Viewer } from "@/components/viewers/baseViewer";
import { GroupItem } from "@/components/items/groupItem";
import { FileItem } from "@/components/items/fileItem";
import { StorageFile } from "@/types/files";

type ItemsGridProps = {
  groups: Group[] | undefined;
  files: StorageFile[] | undefined;
  setFocusedFile: (id: string | null) => void;
  focusedFile: string | null;
}

export function ItemsGrid(props: ItemsGridProps) {
  const navigate = useNavigate()

  const [viewFile, setViewFile] = useState<boolean>(false);

  const handleFileClick = (file: StorageFile) => {
    props.setFocusedFile(props.focusedFile === file.id ? null : file.id)
    setViewFile(true);
  }

  return (
    <div className="flex flex-wrap gap-8 md:gap-3">
      {
        (!props.groups || props.groups.length === 0) && (!props.files || props.files.length === 0) && (
          <div className="w-full h-96 flex justify-center items-center">
            <p className="text-2xl text-gray-500">No files or groups found</p>
          </div>
        )
      }
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
          file={file}
          onClick={() => {
            handleFileClick(file)
          }}
          focused={file.id === props.focusedFile}
        />
      ))}
    </div>
  )
}