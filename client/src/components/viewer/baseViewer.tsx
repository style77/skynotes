
import { File } from "@/store/features/filesApiSlice";

type ViewerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  file: File;
  setFocusedFile: (id: string | null) => void;
}

export function Viewer(props: ViewerProps) {
  const extension = props.file.name.split('.').pop();

  switch (extension) {
    // case 'pdf':
    //   return <PdfViewer {...props} />
    // case 'jpg':
    // case 'jpeg':
    // case 'png':
    // case 'gif':
    //   return <ImageViewer {...props} />
    // case 'mp4':
    // case 'mov':
    // case 'avi':
    // case 'wmv':
    // case 'flv':
    // case 'mkv':
    //   return <VideoViewer {...props} />
    case 'mp3':
    case 'wav':
    case 'aac':
    case 'ogg':
    case 'flac':
      return <AudioViewer {...props} />
    default:
      return <>no</>
    // return <DefaultViewer {...props} />
  }
}

type BaseViewerProps = {
  children: React.ReactNode;
} & ViewerProps

function BaseViewer(props: BaseViewerProps) {

  const handleClose = () => {
    props.setOpen(false);
    props.setFocusedFile(null);
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${props.open ? 'flex' : 'hidden'} justify-center items-center`}>
        <div className={`bg-white w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] rounded-lg overflow-auto z-[9999] ${props.open ? 'block' : 'hidden'} p-4`}>
          <div className="flex justify-end">
            <button onClick={handleClose} className="text-2xl font-bold mb-2">&times;</button>
          </div>
          {props.children}
        </div>
      </div>
    </>
  )
}

function AudioViewer(props: ViewerProps) {
  return (
    <BaseViewer {...props}>
      {/* <audio controls src={`http://localhost:8000${props.file.file}`} /> */}
      <div className="min-w-10/12 min-h-[80%] flex justify-center items-start border-double border-gray-100 border-4 rounded-radius"></div>
    </BaseViewer>
  )
}