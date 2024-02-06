import { zodResolver } from "@hookform/resolvers/zod";
import { Control, UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarClock, KeyRound } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";

type FileShareModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  fileId: string;
  fileName: string;
}

type FileShareFormProps = {
  form: UseFormReturn<{
    shared_until?: Date | undefined;
    password?: string | undefined;
  }>;
}

type FileShareFormField = {
  name: "shared_until" | "password";
  label: string;
  placeholder?: string;
  type: "date" | "password";
  disabled?: boolean;
  control: Control<{
    shared_until?: Date | undefined;
    password?: string | undefined;
  }>;
}

const FormSchema = z.object({
  shared_until: z.date().optional(),
  password: z.string().optional(),
})

const FileFormField = (props: FileShareFormField) => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-4">
          <FormLabel className="text-right select-none">{props.label}
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
              value={field.value?.toString() ?? ""}
              onChange={field.onChange}
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

const FileShareForm = (props: FileShareFormProps) => {
  const [showSharedUntilField, setShowSharedUntilField] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)

  return (
    <div className="grid gap-4 py-4">
      <div className="w-full justify-center gap-2 flex flex-col">
        <div className="flex flex-row gap-2 justify-center">
          <Toggle
            aria-label="Shared until"
            pressed={showSharedUntilField}
            onClick={() => setShowSharedUntilField(!showSharedUntilField)}
          >
            <CalendarClock />
          </Toggle>
          <Toggle
            aria-label="Set password"
            pressed={showPasswordField}
            onClick={() => setShowPasswordField(!showPasswordField)}
          >
            <KeyRound />
          </Toggle>
        </div>
        <div>
          <FormDescription className="col-span-4 text-center text-xs">Choose calendar icon to set expiration date and key icon to set password</FormDescription>
          <FormDescription className="col-span-4 text-center text-xs">You can also share file without setting anything.</FormDescription>
        </div>
      </div>
      {
        showSharedUntilField && (
          <FileFormField
            name="shared_until"
            label="Shared until"
            type="date"
            control={props.form.control}
          />
        )
      }
      {
        showPasswordField && (
          <FileFormField
            name="password"
            label="Password"
            type="password"
            control={props.form.control}
          />
        )
      }
    </div>
  )
}

export const FileShareModal = (props: FileShareModalProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const [isLoading, setIsLoading] = useState(false)

  // const [shareUrl, setShareUrl] = useState<string | null>(null)

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    console.log(data)
    setIsLoading(false)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent className="transition">
        <DialogHeader>
          <DialogTitle>
            Share file
          </DialogTitle>
          <DialogDescription>
            Get a link to share <code>{props.fileName}</code> with others.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FileShareForm form={form} />
            <DialogFooter>
              <Button type="submit" isloading={isLoading ? true : undefined}>
                Share
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}