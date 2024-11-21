import { Outlet, type RouteObject } from 'react-router-dom';
import { homeRoute } from './pages/Home';
import { signinRoute } from './pages/SignIn';
import { signupRoute } from './pages/SignUp';
import { aboutRoute } from './pages/About';
import { profileRoute } from './pages/Profile';
import { Header } from './components/Header';
import { StoreProvider } from './store/store';
import { useRefreshToken } from './utils/axios';
import { privateRoute } from './components/PrivateRoute';

export const appRoute: RouteObject[] = [
  {
    element: <App />,
    children: [
      homeRoute,
      signinRoute,
      signupRoute,
      aboutRoute,
      privateRoute([
        profileRoute
      ])
    ]
  }
];

function App() {
  useRefreshToken();

  return (
    <StoreProvider>
      <Header />
      <Outlet />
    </StoreProvider>
  );
}