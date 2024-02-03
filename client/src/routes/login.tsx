import { RegisterForm } from "@/components/auth/registerForm"
import { LoginForm } from "../components/auth/loginForm"
import { useState } from "react"

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false)

  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center">
      <div className="flex justify-center items-center w-full md:w-2/5">
        {
          showRegister ? <RegisterForm setShowRegister={setShowRegister} /> : <LoginForm setShowRegister={setShowRegister} />
        }
      </div>
      <div className="bg-[url('./images/login-bg.jpg')] md:w-3/5 bg-cover bg-center hidden md:block"></div>
    </div>
  )
}