type SidebarItemProps = {
    name: string;
    href: string;
    icon: React.ElementType;
    onClick: () => void;
    className?: string;
}

export function SidebarItem(props: SidebarItemProps) {
    const Icon = props.icon;
    const isActive = window.location.pathname.startsWith(props.href);

    return (
        <a
            href={props.href}
            className={`inline-flex items-center gap-3 w-full py-4 rounded-3xl ${props.className} ${isActive ? 'bg-primary' : ''}`}
            onClick={props.onClick}
        >
            <Icon className="ml-5" />
            <span>{props.name}</span>
        </a>
    );
}