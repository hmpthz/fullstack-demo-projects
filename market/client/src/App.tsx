import { Outlet, type RouteObject } from 'react-router-dom';
import { homeRoute } from './pages/Home';
import { signinRoute } from './pages/SignIn';
import { signupRoute } from './pages/SignUp';
import { aboutRoute } from './pages/About';
import { profileRoute } from './pages/Profile';
import { Header } from './components/Header';

export const appRoute: RouteObject[] = [
  {
    element: <App />,
    children: [
      homeRoute,
      signinRoute,
      signupRoute,
      aboutRoute,
      profileRoute
    ]
  }
];

function App() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}