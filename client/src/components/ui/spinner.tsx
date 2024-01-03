import { Loader2 } from "lucide-react";

type SpinnerProps = {
    className?: string;
};

const Spinner = (props: SpinnerProps) => {
    return (
        <Loader2 className={`animate-spin ${props.className}`} />
    );
};

export default Spinner;