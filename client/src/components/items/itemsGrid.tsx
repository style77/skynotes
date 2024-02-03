import { Group } from "@/store/features/groupsApiSlice";
import { File } from "@/store/features/filesApiSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Viewer } from "@/components/viewers/baseViewer";
import { GroupItem } from "@/components/items/groupItem";
import { FileItem } from "@/components/items/fileItem";

type ItemsGridProps = {
  groups: Group[] | undefined;
  files: File[] | undefined;
  setFocusedFile: (id: string | null) => void;
  focusedFile: string | null;
}

export function ItemsGrid(props: ItemsGridProps) {
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
          thumbnail={file.thumbnail}
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