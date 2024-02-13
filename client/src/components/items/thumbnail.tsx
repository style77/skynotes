import { File, FileArchive, FileAudio, FileBarChart, FileCog, FileSpreadsheet, FileText } from "lucide-react";
import { useState, useEffect } from "react";

interface ThumbnailProps {
  fileName: string;
  mediaUrl: string | null;
}

export const Thumbnail = (props: ThumbnailProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchThumbnail = async () => {
      const url = `${import.meta.env.VITE_API_URL}${props.mediaUrl}?thumbnail=true`
      try {
        const response = await fetch(url, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch thumbnail');
        }

        setThumbnailUrl(url);
      } catch (e) {
        setThumbnailUrl(null)
      }
    }

    if (props.mediaUrl) fetchThumbnail();
    else setThumbnailUrl(null);
  }, [props.mediaUrl]);

  const getIconByExtension = (extension: string) => {
    const className = "text-gray-300/25 absolute left-4 top-4";
    const size = 56;

    const mappings: { extensions: string[], component: React.ReactNode }[] = [
      { extensions: ["mp3", "wav", "flac", "ogg", "m4a", "wma", "aac", "aiff", "alac", "dsd", "pcm", "mp2"], component: <FileAudio size={size} className={className} /> },
      { extensions: ["pdf"], component: <File size={size} className={className} /> },
      { extensions: ["doc", "docx"], component: <File size={size} className={className} /> },
      { extensions: ["xls", "xlsx"], component: <FileSpreadsheet size={size} className={className} /> },
      { extensions: ["csv", "ods", "tsv", "tab", "xlsm", "xlsb", "xltx"], component: <FileBarChart size={size} className={className} /> },
      { extensions: ["ppt", "pptx"], component: <File size={size} className={className} /> },
      { extensions: ["txt"], component: <FileText size={size} className={className} /> },
      { extensions: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"], component: <FileArchive size={size} className={className} /> },
      { extensions: ["config", "conf", "ini", "log", "md", "json", "xml", "yml", "yaml", "toml", "env", "properties", "cfg"], component: <FileCog size={size} className={className} /> },
    ];

    const component = mappings.find(mapping => mapping.extensions.includes(extension))?.component || <File size={size} className={className} />;

    return component;
  };

  return (
    <div className="w-full select-none bg-white rounded-t-radius">
      {
        thumbnailUrl ? (
          <div className="relative rounded-t-radius h-24 w-full">
            <img src={thumbnailUrl} alt={`Thumbnail for ${props.fileName}`} className="rounded-t-radius h-24 w-full select-none" />
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-t-radius bg-gradient-to-b from-black/40 to-black/75"></div>
          </div>
        ) : (
          <div className="w-full h-24 rounded-t-radius">
            <div className="flex flex-col items-center justify-center h-full">
              {getIconByExtension(props.fileName.split('.').pop() || '')}
              <div className="text-xs font-semibold text-gray-400">No thumbnail available</div>
            </div>
          </div>
        )
      }
    </div>
  );
};