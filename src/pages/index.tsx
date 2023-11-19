import { Navigate, Outlet } from "react-router-dom";
import { Map } from "./map";
import { Home } from "./home";


function RootLayout() {
   return (
      <main className="w-screen h-screen bg-gray-100">
         <Outlet />
      </main>
   );
}

export const appRoutes = [
   {
      path: '/',
      element: <RootLayout/>,
      children: [
         { index: true, element: <Navigate to='/map' replace/>},
         {
            path: 'map',
            element: <Map/>
         }
      ]
   }
]