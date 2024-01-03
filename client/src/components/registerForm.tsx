import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { LoginInput } from "@/components/loginInput"
import { HelpCircle } from "lucide-react"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { useRegisterMutation } from "@/store/features/authApiSlice"
import { useState } from "react"

import { useNavigate } from "react-router-dom";

const formSchema = z.object({
    email: z.string().min(6, {
        message: "Email must be at least 6 characters.",
    }).email("This is not valid email."),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
});

type RegisterFormSchemaType = z.infer<typeof formSchema>;

export function RegisterForm() {
    const [register, { isLoading }] = useRegisterMutation();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [errors, setErrors] = useState<string[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    const onSubmit = async (data: RegisterFormSchemaType) => {

        // cleanup
        setErrors([])

        const { email, password } = data;
        try {
            await register({ email, password }).unwrap()

            toast({
                title: "Your account was succesfully created!",
            });

            navigate("/login")

        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast({
                variant: "destructive",
                title: "Failed to sign up.",
                description: error.error,
            });

            // check if error.data is dict
            if (typeof error.data === "object") {
                const errorMessages = Object.values(error.data).flat() as string[]
                setErrors(errorMessages)
            } else {
                setErrors([error.data])
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="shadow-lg shadow-[rgba(0, 0, 0, 0.25)] px-14 py-12 rounded-xl bg-card dark:bg-card-foreground">
                <h1 className="text-center font-bold text-xl leading-relaxed">Create new account</h1>
                <p className="text-center text-sm p-0 m-0 text-[#667085]">Welcome! Please enter your details.</p>
                <div className="space-y-6 my-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <LoginInput className="border-x-0 border-t-0 focus:bg-transparent" type="email" placeholder="Enter your email" icon="email" iconStyle="w-5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <div className="flex flex-row items-center gap-2">
                                        Password
                                        <TooltipProvider delayDuration={100}>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <HelpCircle className="w-4" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>* 8 minimum characters</p>
                                                    <p>* No common passwords</p>
                                                    <p>* 1 uppercase, 1 lowercase, 1 number, 1 special character</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </FormLabel>
                                <FormControl>
                                    <LoginInput className="border-x-0 border-t-0 focus:bg-transparent" type="password" placeholder="••••••••" icon="password" iconStyle="w-4" passwordTooltip={true} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Confirm Password
                                </FormLabel>
                                <FormControl>
                                    <LoginInput className="border-x-0 border-t-0 focus:bg-transparent" type="password" placeholder="••••••••" icon="password" iconStyle="w-4" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-4">
                    <div>
                        <Button className="bg-primary w-full" type="submit" isloading={isLoading}>Sign in</Button>
                        {
                            errors.length > 0 && (
                                <div className="flex flex-col items-center justify-center space-y-2 mx-2 mt-1">
                                    {
                                        errors.map((error) => (
                                            <p className="text-sm text-red-500" key={error}>{error}</p>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div className="flex flex-row text-center justify-center space-x-1">
                        <p className="text-sm text-[#667085]">Already created account?</p><a href="/login" className="text-sm text-primary font-bold hover:scale-105 transition">Sign in!</a>
                    </div>
                    <div className="flex flex-row text-center justify-center">
                        <Button className="text-sm bg-transparent text-primary font-bold hover:scale-105 transition hover:bg-transparent opacity-70">Talk to support</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}