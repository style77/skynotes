import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Control, UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"
import { Input } from "../ui/input";
import { useRetrieveGroupsQuery } from "@/store/features/groupsApiSlice";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronLeft } from "lucide-react";

import Dropzone from 'react-dropzone'

type NewFileModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
}

type FileFormProps = {
    form: UseFormReturn<{
        name: string;
        group?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
    }, undefined>;
}

type FileFormFieldProps = {
    name: "name" | "group" | "description" | "tags" | `tags.${number}`;
    label: string;
    placeholder?: string;
    type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search" | "file" | "date" | "time" | "datetime-local" | "month" | "week" | undefined;
    disabled?: boolean;
    control: Control<{
        name: string;
        group?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
    }, any>;  // eslint-disable-line @typescript-eslint/no-explicit-any
}

type GroupSelectionFieldProps = {
    form: UseFormReturn<{
        name: string;
        group?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
    }, undefined>;
} & FileFormFieldProps

const FormSchema = z.object({
    name: z.string({
        required_error: "Name is required",
    }).min(3).max(128),
    group: z.string().min(3).max(128).optional(),
    description: z.string({}).max(512).optional(),
    tags: z.array(z.string()).max(512).optional(),
})

const GroupSelectionField = (props: GroupSelectionFieldProps) => {
    const { data, error, isLoading } = useRetrieveGroupsQuery()

    const [groups, setGroups] = useState<{ label: string, value: string | undefined }[]>([])

    useEffect(() => {
        if (data && !error && !isLoading) {
            setGroups([
                { label: "No group", value: undefined },
                ...data.map(group => ({
                    label: group.name,
                    value: group.id,
                })),
            ]);
        }
    }, [data, error, isLoading])

    return (
        <FormField
            control={props.control}
            name={props.name}
            render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">{props.label}</FormLabel>
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
                                        ? groups.find(
                                            (group) => group.value === field.value
                                        )?.label
                                        : field.value === undefined ? "No group" : "Select group"}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="col-span-3 p-0">
                            <Command>
                                <CommandEmpty>No icon found.</CommandEmpty>
                                <CommandGroup>
                                    {groups.map((group) => (
                                        <CommandItem
                                            value={group.label}
                                            key={group.value}
                                            onSelect={() => {
                                                props.form.setValue("group", group.value)
                                            }}
                                        >
                                            {group.label}
                                            <CheckIcon
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    group.value === field.value
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
                    <FormMessage className="col-span-3" />
                </FormItem>
            )}
        />
    )
}

function FileFormField(props: FileFormFieldProps) {
    return (
        <FormField
            control={props.control}
            name={props.name}
            render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">{props.label}
                        {
                            props.disabled && (
                                <FormDescription className="col-span-4 text-right text-xs">This feature is not yet available.</FormDescription>
                            )
                        }
                    </FormLabel>
                    <FormControl>
                        <Input
                            id={props.name}
                            placeholder={props.placeholder ?? props.label}
                            type={props.type ?? "text"}
                            className="col-span-3"
                            // {...(props.type !== "file" && { value: Array.isArray(field.value) ? field.value.join(', ') : field.value })}
                            value={field.value}
                            onChange={props.type === "file" ? (e) => field.onChange(e) : field.onChange}
                            disabled={props.disabled}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                        />
                    </FormControl>
                    <FormMessage className="col-span-3" />
                </FormItem>
            )}
        />
    )
}

function FileForm(props: FileFormProps) {
    return (
        <div className="grid gap-4 py-4">
            <FileFormField name="name" label="File Name" control={props.form.control} placeholder="My awesome song" />
            <GroupSelectionField name="group" label="Group" control={props.form.control} placeholder="Music" form={props.form} />
            <FileFormField name="description" label="Description" control={props.form.control} placeholder="This is my awesome song" />
            <FileFormField name="tags" label="Tags" control={props.form.control} placeholder="music, awesome" disabled={true} />
        </div>
    )
}


export function NewFileModal(props: NewFileModalProps) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    const [isLoading, setIsLoading] = useState(false)

    const [file, setFile] = useState<File | undefined>(undefined)

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)
        console.log(data)
        setIsLoading(false)
        props.setOpen(false)
    }

    return (
        <Dialog open={props.open} onOpenChange={props.setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex flex-row items-center gap-2">
                        {
                            file && (
                                <button className="p-2 rounded-lg hover:bg-gray-100 transition" onClick={() => setFile(undefined)}>
                                    <ChevronLeft width={15} />
                                </button>
                            )
                        }
                        New File
                    </DialogTitle>
                    <DialogDescription>
                        {
                            file ? "Fill in the details for your file." : "Drag and drop a file to upload."
                        }
                    </DialogDescription>
                </DialogHeader>
                {
                    file ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <FileForm form={form} />
                                <DialogFooter>
                                    <Button type="submit" isloading={isLoading ? true : undefined}>Upload file</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    ) : (
                        <Dropzone onDrop={acceptedFiles => setFile(acceptedFiles[0])} maxFiles={1}>
                            {({ getRootProps, getInputProps }) => (
                                <div className="border-dashed border border-gray-600/50 rounded-lg px-2 py-8 flex flex-col justify-center items-center" {...getRootProps()}>
                                    <input {...getInputProps()} multiple={false} />
                                    <span className="text-sm text-gray-500 text-center select-none">Drag 'n' drop some files here, or click to select files</span>
                                </div>
                            )}
                        </Dropzone>
                    )
                }
            </DialogContent>
        </Dialog >
    )
}