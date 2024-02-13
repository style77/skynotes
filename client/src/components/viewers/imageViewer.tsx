import { useEffect, useState } from "react";
import { BaseViewer, ViewerProps } from "./baseViewer";

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
            <img src={imageBlob ? URL.createObjectURL(imageBlob) : ""} alt={props.file.name} className="py-4" />
        </BaseViewer>
    )
}