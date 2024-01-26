import React from "react";
import { InputProps } from "./ui/input";
import { cn } from "@/lib/utils";
import { Mail, KeyRound, LucideIcon } from "lucide-react"

export type LoginInputProps = InputProps & {
    passwordTooltip?: boolean;
    icon?: "email" | "password"
    iconstyle?: string
}

const iconsMap: {
    [key in "email" | "password"]: LucideIcon
} = {
    email: Mail,
    password: KeyRound
}

const LoginInput = React.forwardRef<HTMLInputElement, LoginInputProps>(
    ({ className, ...props }, ref) => {
        const SelectedIcon = props.icon ? iconsMap[props.icon] : null;

        return (
            <div
                className={cn(
                    "flex h-10 transition items-center rounded-md border border-input bg-white pl-3 text-sm ring-offset-background focus-within:border-primary",
                    className,
                )}
            >
                {SelectedIcon && <SelectedIcon className={cn(
                    "",
                    props.iconstyle
                )} />}
                <input
                    {...props}
                    type={props.type}
                    ref={ref}
                    className="w-full p-2 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
        );
    },
);

LoginInput.displayName = "Login";

export { LoginInput };