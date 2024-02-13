import { useEffect, useRef, useState } from "react";
import { BaseViewer, ViewerProps } from "./baseViewer";
import { BouncingDotsLoader } from "../ui/bouncing-dots";
import { SkipBack, Pause, Play, SkipForward, VolumeX, Volume2 } from "lucide-react";

export function VideoViewer(props: ViewerProps) {
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [muted, setMuted] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(0.5);
    const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
    const [hoverProgress, setHoverProgress] = useState<number>(0);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        setIsLoading(true);
        const url = `${import.meta.env.VITE_API_URL}${props.file.file}`
        fetch(url, { method: "GET", credentials: 'include' })
            .then((res) => res.blob())
            .then((blob) => setVideoBlob(blob))
            .finally(() => setIsLoading(false));
    }, [props.file.file]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    }, [volume]);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setMuted(videoRef.current.muted);
        }
    }

    const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setVolume(value);
    }

    const updateHoverProgress = (e: React.MouseEvent<HTMLDivElement>) => {
        if (progressBarRef.current) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const progress = (x / width) * 100;
            setHoverProgress(progress);
        }
    }

    const getProgress = () => {
        if (videoRef.current) {
            return (videoRef.current.currentTime / videoRef.current.duration) * 100;
        }
        return 0;
    }

    const seekVideo = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current && progressBarRef.current) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const progress = (x / width);
            videoRef.current.currentTime = videoRef.current.duration * progress;
        }
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }

    const skipBackHandler = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
    }

    const skipForwardHandler = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = videoRef.current.duration;
        }
    }

    const playHandler = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
            setIsPlaying(!videoRef.current.paused);
        }
    }

    return (
        <BaseViewer {...props}>
            <div className="relative w-full h-full">
                {isLoading ? (
                    <BouncingDotsLoader className="mt-16" />
                ) : videoBlob && (
                    <video ref={videoRef} className="absolute bottom-2 w-full h-full" controls={false}>
                        <source src={URL.createObjectURL(videoBlob)} type="video/mp4" className="h-full w-full" />
                    </video>
                )
                }
            </div>
            {
                !isLoading && videoRef.current && (
                    <div className="flex-grow w-full">
                        <div
                            className="relative cursor-pointer"
                            ref={progressBarRef}
                            onClick={seekVideo}
                            onMouseMove={updateHoverProgress}
                            onMouseLeave={() => setHoverProgress(0)}
                        >
                            <div className="h-2 bg-gray-800 rounded-radius">
                                <div className="bg-primary h-2 rounded-radius absolute" style={{ width: `${getProgress()}%` }}></div>
                                <div className="bg-primary/50 h-2 rounded-radius absolute" style={{ width: `${hoverProgress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs mt-2">
                                <span className={`${isPlaying ? "text-gray-300" : "text-gray-400"} transition`}>{formatTime(videoRef.current.currentTime)}</span>
                                <span className={`${isPlaying ? "text-gray-300" : "text-gray-400"} transition`}>{formatTime(videoRef.current.duration)}</span>
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