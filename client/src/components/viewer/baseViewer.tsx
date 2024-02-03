
import { File } from "@/store/features/filesApiSlice";
import { Download, Link, MoreHorizontal, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useWavesurfer } from '@wavesurfer/react'
import { setContextMenuFunctionality, setShowYScroll } from "@/store/features/interfaceSlice";
import { useAppDispatch } from "@/store/hooks";


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
      return <></>
    // return <DefaultViewer {...props} />
  }
}

type BaseViewerProps = {
  children: React.ReactNode;
} & ViewerProps

function BaseViewer(props: BaseViewerProps) {

  const dispatch = useAppDispatch();

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
      const response = await fetch(`http://localhost:8000${props.file.file}`, {
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
      <div className={`fixed inset-0 z-40 bg-black text-white justify-between items-center p-4 flex-col h-full w-full ${props.open ? "flex" : "hidden"}`}>
        <div className="w-full justify-between flex flex-row items-center">
          <div className="flex flex-row gap-6">
            <Download className="text-gray-300 hover:text-white cursor-pointer" size={22} onClick={handleDownload} />
            <Link className="text-gray-300 hover:text-white cursor-pointer" size={22} />
            <MoreHorizontal className="text-gray-300 hover:text-white cursor-pointer" size={22} />
          </div>
          <X className="text-gray-300 hover:text-white cursor-pointer" size={24} onClick={handleClose} />
        </div>
        {props.children}
      </div>
    </>
  )
}

function AudioViewer(props: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverProgress, setHoverProgress] = useState<number>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [volume, setVolume] = useState<number>(0.5);
  const [muted, setMuted] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const lastVolumeRef = useRef<number>(volume);

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: 200,
    waveColor: '#7c3aed',
    progressColor: '#6c23eb',
    cursorColor: '#5f14e0',
    barWidth: 2,
    barRadius: 3,
    normalize: true,
    interact: false,
    cursorWidth: 0,
  });

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const response = await fetch(`http://localhost:8000${props.file.file}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        wavesurfer!.loadBlob(blob);
      } catch (e) {
        console.error('Failed to fetch audio:', e);
      }
    };

    if (wavesurfer) {
      fetchAudio();
    }
  }, [props.file.file, wavesurfer]);

  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.setVolume(volume);
      if (volume === 0) {
        setMuted(true);
      } else {
        setMuted(false);
      }
    }
  }, [volume, wavesurfer]);

  const playHandler = () => {
    wavesurfer && wavesurfer.playPause()
  };
  const skipBackHandler = () => {
    wavesurfer && wavesurfer.setTime(0)
  };
  const skipForwardHandler = () => {
    wavesurfer && wavesurfer.setTime(wavesurfer.getDuration())
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }

  const getProgress = () => {
    if (wavesurfer) {
      const progress = (wavesurfer.getCurrentTime() / wavesurfer.getDuration()) * 100;
      return progress;
    }
    return 0;
  }

  const seekAudio = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = progressBarRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalWidth = rect.width;
    const percentage = (x / totalWidth) * 100;
    wavesurfer!.seekTo(percentage / 100);
  };

  const updateHoverProgress = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = progressBarRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalWidth = rect.width;
    const percentage = (x / totalWidth) * 100;
    setHoverProgress(percentage);
  };

  const toggleMute = () => {
    if (wavesurfer) {
      if (!muted) {
        lastVolumeRef.current = wavesurfer.getVolume();
        wavesurfer.setVolume(0);
        setMuted(true);
      } else {
        wavesurfer.setVolume(lastVolumeRef.current);
        setMuted(false);
      }
    }
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (muted && newVolume > 0) {
      setMuted(false);
    }
  };

  return (
    <BaseViewer {...props}>
      <div className="relative w-full h-full">
        <div className="absolute bottom-10 w-full" ref={containerRef} />
      </div>
      {
        wavesurfer && (
          <div className="flex-grow w-full">
            <div
              className="mb-2 relative cursor-pointer"
              ref={progressBarRef}
              onClick={seekAudio}
              onMouseMove={updateHoverProgress}
              onMouseLeave={() => setHoverProgress(0)}
            >
              <div className="h-2 bg-gray-800 rounded-radius">
                <div className="bg-primary h-2 rounded-radius absolute" style={{ width: `${getProgress()}%` }}></div>
                <div className="bg-primary/50 h-2 rounded-radius absolute" style={{ width: `${hoverProgress}%` }}></div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(wavesurfer.getDuration())}</span>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4">
              <SkipBack className="text-gray-400 hover:text-white cursor-pointer" size={24} onClick={skipBackHandler} />
              {
                isPlaying ? <Pause className="text-gray-400 hover:text-white cursor-pointer" size={24} onClick={playHandler} /> : <Play className="text-gray-400 hover:text-white cursor-pointer" size={24} onClick={playHandler} />
              }
              <SkipForward className="text-gray-400 hover:text-white cursor-pointer" size={24} onClick={skipForwardHandler} />
              <div
                className="relative items-center gap-4 flex cursor-pointer"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button onClick={toggleMute}>
                  {muted ? (
                    <VolumeX className="text-gray-400 cursor-pointer" size={24} />
                  ) : (
                    <Volume2 className="text-gray-400 cursor-pointer" size={24} />
                  )}
                </button>
                {showVolumeSlider && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={changeVolume}
                    className="absolute bottom-full w-16 cursor-pointer accent-primary"
                  />
                )}
              </div>
            </div>
          </div>
        )
      }
    </BaseViewer>
  )
}