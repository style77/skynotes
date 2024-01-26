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
import { Fingerprint } from "lucide-react"
import { useLoginMutation } from "@/store/features/authApiSlice"
import { useToast } from "./ui/use-toast"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { isLoadingFinished, setAuth } from "@/store/features/authSlice"
import { store } from "@/store"

const formSchema = z.object({
    email: z.string().min(6, {
        message: "Email must be at least 6 characters.",
    }).email("This is not valid email."),
    password: z.string(),
})

type LoginFormSchemaType = z.infer<typeof formSchema>;

export function LoginForm() {
    const [login, { isLoading }] = useLoginMutation();
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

    const onSubmit = async (data: LoginFormSchemaType) => {
        const { email, password } = data;
        try {
            await login({ email, password }).unwrap()
            store.dispatch(setAuth())
            store.dispatch(isLoadingFinished())
            navigate("/dashboard")
        } catch (error: any) {  // eslint-disable-line @typescript-eslint/no-explicit-any
            toast({
                variant: "destructive",
                title: "Failed to sign in.",
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
                <h1 className="text-center font-bold text-xl leading-relaxed">Sign in to your account</h1>
                <p className="text-center text-sm p-0 m-0 text-[#667085]">Welcome back! Please enter your details.</p>
                <div className="space-y-6 my-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <LoginInput className="border-x-0 border-t-0 focus:bg-transparent" type="email" placeholder="Enter your email" icon="email" iconstyle="w-5" {...field} />
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <LoginInput className="border-x-0 border-t-0 focus:bg-transparent" type="password" placeholder="••••••••" icon="password" iconstyle="w-4" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-4">
                    <div>
                        <Button className="bg-primary w-full" type="submit" isloading={isLoading ? true : undefined}>Sign in</Button>
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
                    <div className="w-full h-6 justify-center items-center gap-2.5 inline-flex">
                        <div className="w-full h-px border border-primary border-opacity-75"></div>
                        <div className="text-primary text-base font-sans leading-normal">or</div>
                        <div className="w-full h-px border border-primary border-opacity-75"></div>
                    </div>
                    <Button className="bg-white text-black border border-zinc-300 w-full hover:text-white" type="submit">
                        <div className="flex flex-row items-center gap-2">
                            <Fingerprint className="w-4" /> Sign in with Code
                        </div>
                    </Button>
                    <div className="flex flex-row text-center justify-center space-x-1">
                        <p className="text-sm text-[#667085]">Don't have an account?</p><a href="/register" className="text-sm text-primary font-bold hover:scale-105 transition">Sign up!</a>
                    </div>
                    <div className="flex flex-row text-center justify-between">
                        <Button className="text-sm bg-transparent text-primary font-bold hover:scale-105 transition hover:bg-transparent opacity-70">Talk to support</Button><Button className="bg-transparent text-sm text-primary font-bold hover:scale-105 transition hover:bg-transparent opacity-70">Forgot password</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}