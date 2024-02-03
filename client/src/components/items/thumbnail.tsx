import { useState, useEffect } from "react";

interface ThumbnailProps {
  mediaUrl: string;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ mediaUrl }) => {

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