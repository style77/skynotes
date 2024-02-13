import { useState } from 'react';

type SpoilerProps = {
    text: string;
}

const Spoiler = ({ text }: SpoilerProps) => {
  const [revealed, setRevealed] = useState(false);

  const handleSpoilerClick = () => {
    setRevealed(true);
  };

  return (
    <div className="w-full">
      {revealed ? (
        <span>{text}</span>
      ) : (
        <span onClick={handleSpoilerClick} className="cursor-pointer w-full bg-black">
          <span className="text-black">{text.substring(0, 2)}</span>
          <span className="text-transparent bg-black hover:bg-black/80 transition">{text.substring(2)}</span>
        </span>
      )}
    </div>
  );
};

export default Spoiler;