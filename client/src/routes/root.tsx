import { useAppSelector } from "@/store/hooks";
import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

const HomeNavigationMenu = () => {

  const { isUserAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  const SEPARATOR = '•';

  const items = {
    'Home': '/',
    'Product': '/#about',
    'Services': '/#services',
    'Pricing': '/#pricing',
    'Customers': '/#customers',
    'FAQ': '/#faq',
  }

  return (
    <nav className="py-4 w-full justify-around items-center flex">
      <div></div>
      <div>
        {Object.entries(items).map(([label, path], index) => (
          <span key={path}>
            <Link to={path} className="text-sm font-medium text-[#1e2023] hover:text-[#7b7d83] transition">
              {label}
            </Link>
            {index < Object.keys(items).length - 1 && (
              <span className="mx-6 text-[#1e2023] cursor-default select-none">{SEPARATOR}</span>
            )}
          </span>
        ))}
      </div>
      {
        isUserAuthenticated ? (
          <a href="/dashboard" className="bg-transparent px-6 py-1.5 border border-gray-600 text-sm font-medium">
            Dashboard
          </a>
        ) : (
          <a href="/login" className="bg-transparent px-6 py-1.5 border border-gray-600 text-sm font-medium">
            Login
          </a>
        )
      }
    </nav>
  )
}

export default function Root() {
  return (
    <main className="min-h-screen w-full flex flex-col">
      <HomeNavigationMenu />
      <div className="relative w-full flex justify-center lg:items-center py-16 md:py-56">
        <div className="absolute inset-0 bg-[url('images/home-bg.jpg')] opacity-60 bg-no-repeat bg-bottom bg-cover">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white" />
        </div>

        <div className="items-center flex flex-col gap-10 z-10">
          <h1 className="relative text-5xl lg:text-8xl text-center font-medium px-14 xl:mx-96 font-lora text-[#1e2023] cursor-default">
            Harness the Power of Our Lite Cloud Storage
          </h1>
          <a href="/#about" className="bg-[#1e2023] text-white text-sm font-regular px-8 py-3.5 font-lora items-center flex-row flex gap-3 shadow-sm mt-10">
            Get started <MoveRight />
          </a>
        </div>
      </div>
    </main>
  );
}