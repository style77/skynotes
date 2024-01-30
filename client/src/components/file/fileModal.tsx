import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "../ui/input";

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
        file: File;
    }, undefined>;
}

const FormSchema = z.object({
    name: z.string({
        required_error: "Name is required",
    }).min(3).max(128),
    group: z.string().min(3).max(128).optional(),
    description: z.string({}).max(512).optional(),
    tags: z.array(z.string()).max(512).optional(),
    file: z.instanceof(File).refine((file) => file.size < 1024 * 1024 * 100, {
        message: "File must be less than 100MB",
    }),
})

type FileFormFieldProps = {
    name: "name" | "group" | "description" | "tags" | "file" | `tags.${number}`;
    label: string;
    placeholder?: string;
    type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search" | "file" | "date" | "time" | "datetime-local" | "month" | "week" | undefined;
    control: Control<{
        name: string;
        group?: string | undefined;
        description?: string | undefined;
        tags?: string[] | undefined;
        file: File;
    }, any>;  // eslint-disable-line @typescript-eslint/no-explicit-any
}

function FileFormField(props: FileFormFieldProps) {
    return (
        <FormField
            control={props.control}
            name={props.name}
            render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">{props.label}</FormLabel>
                    <FormControl>
                        <Input
                            id={props.name}
                            placeholder={props.placeholder ?? props.label}
                            type={props.type ?? "text"}
                            className="col-span-3"
                            value={typeof field.value === 'string' ? field.value : undefined}
                            onChange={field.onChange}
                            disabled={field.disabled}
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
            <FileFormField name="group" label="Group" control={props.form.control} placeholder="Music" />
            <FileFormField name="description" label="Description" control={props.form.control} placeholder="This is my awesome song" />
            <FileFormField name="tags" label="Tags" control={props.form.control} placeholder="music, awesome" />
            <FileFormField name="file" label="File" control={props.form.control} type="file" placeholder="My awesome song" />
        </div>
    )
}


export function NewFileModal(props: NewFileModalProps) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    const [isLoading, setIsLoading] = useState(false)

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
                    <DialogTitle>New File</DialogTitle>
                    <DialogDescription>
                        Upload new file.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FileForm form={form} />
                        <DialogFooter>
                            <Button type="submit" isloading={isLoading ? true : undefined}>Upload file</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}