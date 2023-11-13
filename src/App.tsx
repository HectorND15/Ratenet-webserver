import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { appRoutes } from "@/pages"

export const router = createBrowserRouter(appRoutes)

function App() {
	return (
		<RouterProvider router={router}></RouterProvider>
	)
}

export default App
