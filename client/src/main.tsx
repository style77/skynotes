import * as React from "react";
import * as ReactDOM from "react-dom/client";
import Root from "./routes/root"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import ErrorPage from "./error-page";
import LoginPage from "./routes/login";
import Dashboard from "./routes/dashboard";
import CustomProvider from "@/store/provider";
import { Toaster } from "@/components/ui/toaster";
import RequireAuth from "@/components/auth/requireAuth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "dashboard",
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CustomProvider>
      <RouterProvider router={router} />
      <Toaster />
    </CustomProvider>
  </React.StrictMode>
);