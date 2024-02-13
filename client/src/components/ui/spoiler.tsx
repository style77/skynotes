import { useState } from 'react';

type SpoilerProps = {
    text: string;
    type: "blur" | "blackout";
}

const Spoiler = ({ text, type }: SpoilerProps) => {
    const [revealed, setRevealed] = useState(false);

    const handleSpoilerMouseOver = () => {
        setRevealed(true);
    };

    const handleSpoilerMouseOut = () => {
        setRevealed(false);
    };

    const backgroundStyle = type === "blackout" ? "bg-black" : "";

    return (
        <div className="w-full">
            <div
                onMouseOver={handleSpoilerMouseOver}
                onMouseOut={handleSpoilerMouseOut}
                className={`cursor-pointer w-full ${revealed ? "bg-transparent" : backgroundStyle} transition duration-500 rounded-radius`}
            >
                <span
                    className={`select-none ${revealed || type !== "blur" ? "blur-0" : "blur-sm"} transition`}
                >
                    {text}
                </span>
            </div>
        </div>
    );
};

export default Spoiler;