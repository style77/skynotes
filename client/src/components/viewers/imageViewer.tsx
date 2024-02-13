import { useEffect, useState } from "react";
import { BaseViewer, ViewerProps } from "./baseViewer";
import { AspectRatio } from "@/components/ui/aspect-ratio"

export function ImageViewer(props: ViewerProps) {
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);

    useEffect(() => {
        const url = `${import.meta.env.VITE_API_URL}${props.file.file}`
        fetch(url, { method: "GET", credentials: 'include' })
            .then((res) => res.blob())
            .then((blob) => setImageBlob(blob));
    }, [props.file.file]);

    return (
        <BaseViewer {...props}>
            <div className="w-full h-10/12 flex justify-center">
                <AspectRatio ratio={16 / 9} className="w-full h-full">
                    <img src={imageBlob ? URL.createObjectURL(imageBlob) : ""} alt={props.file.name} className="py-4 w-full h-full" />
                </AspectRatio>
            </div>
        </BaseViewer>
    )
}