import { Sidebar } from "@/components/sidebar"

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center">
      <div className="flex w-full">
        <Sidebar />
      </div>
    </div>
  )
}