import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CheckIcon, FolderPlus } from "lucide-react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"
import { Group, useCreateGroupMutation, useUpdateGroupMutation } from "@/store/features/groupsApiSlice"
import { DropdownMenuItem } from "../ui/dropdown-menu"

const icons = [
    { label: "Default", value: "default" },
    { label: "Music", value: "music" },
    { label: "Video", value: "video" },
    { label: "Photo", value: "photo" },
    { label: "Document", value: "document" },
    { label: "Archive", value: "archive" },
] as const


const FormSchema = z.object({
    name: z.string({
        required_error: "Name is required",
    }).min(3).max(128),
    icon: z.string({
        required_error: "Icon is required",
    }),
    description: z.string({
    }).max(512).optional(),
})

type UpdateGroupModalProps = {
    group: Group;
}

export function EditGroupModal(props: UpdateGroupModalProps) {
    const [ updateGroup ] = useUpdateGroupMutation()
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            icon: props.group.icon,
            name: props.group.name,
            description: props.group.description,
        },
    })

    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)
        await updateGroup(data).unwrap();
        setIsLoading(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onClick={() => setOpen(true)}>Edit</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Group</DialogTitle>
                    <DialogDescription>
                        Update group details.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                placeholder="Summer Photos"
                                                className="col-span-3"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="col-span-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <>
                                        <FormItem className="grid grid-cols-4 items-center gap-4">
                                            <FormLabel className="text-right">Icon</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "col-span-3 justify-between",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? icons.find(
                                                                    (icon) => icon.value === field.value
                                                                )?.label
                                                                : "Select icon"}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="col-span-3 p-0">
                                                    <Command>
                                                        <CommandEmpty>No framework found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {icons.map((icon) => (
                                                                <CommandItem
                                                                    value={icon.label}
                                                                    key={icon.value}
                                                                    onSelect={() => {
                                                                        form.setValue("icon", icon.value)
                                                                    }}
                                                                >
                                                                    {icon.label}
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "ml-auto h-4 w-4",
                                                                            icon.value === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                        <FormMessage className="col-span-2" />
                                    </>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="description"
                                                placeholder="Summer Photos 2021 Vienna"
                                                className="col-span-3"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="col-span-2" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" isloading={isLoading}>Create group</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export function NewGroupModal() {
    const [ createGroup ] = useCreateGroupMutation()
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            icon: "default",
        },
    })

    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)
        await createGroup(data).unwrap();
        setIsLoading(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-white text-black hover:text-white flex flex-row items-center">
                    <div>
                        <FolderPlus />
                    </div>
                    <span className="ml-2 font-semibold">New group</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Group</DialogTitle>
                    <DialogDescription>
                        Create new group to share files with other users.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                placeholder="Summer Photos"
                                                className="col-span-3"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="col-span-3" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <>
                                        <FormItem className="grid grid-cols-4 items-center gap-4">
                                            <FormLabel className="text-right">Icon</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "col-span-3 justify-between",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? icons.find(
                                                                    (icon) => icon.value === field.value
                                                                )?.label
                                                                : "Select icon"}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="col-span-3 p-0">
                                                    <Command>
                                                        <CommandEmpty>No framework found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {icons.map((icon) => (
                                                                <CommandItem
                                                                    value={icon.label}
                                                                    key={icon.value}
                                                                    onSelect={() => {
                                                                        form.setValue("icon", icon.value)
                                                                    }}
                                                                >
                                                                    {icon.label}
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "ml-auto h-4 w-4",
                                                                            icon.value === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                        <FormMessage className="col-span-2" />
                                    </>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="description"
                                                placeholder="Summer Photos 2021 Vienna"
                                                className="col-span-3"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="col-span-2" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" isloading={isLoading}>Update group</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}