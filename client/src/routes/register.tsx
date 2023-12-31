import { RegisterForm } from "@/components/registerForm"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center">
      <div className="flex justify-center items-center w-full md:w-2/5">
        <RegisterForm />
      </div>
      <div className="bg-[url('./images/login-bg.jpg')] md:w-3/5 bg-cover bg-center hidden md:block"></div>
    </div>
  )
}