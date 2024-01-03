import { LoginForm } from "../components/loginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center">
      <div className="flex justify-center items-center w-full md:w-2/5">
        <LoginForm />
      </div>
      <div className="bg-[url('./images/login-bg.jpg')] md:w-3/5 bg-cover bg-center hidden md:block"></div>
    </div>
  )
}