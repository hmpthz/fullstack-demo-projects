import { Navigate, Outlet, type RouteObject } from 'react-router-dom';
import { useRootStore } from '@/store/store';
import { LoadSpinner } from './UI';

export const privateRoute: (children: RouteObject[]) => RouteObject = (children) => ({
  element: <Private />,
  children
});

function Private() {
  const { accessToken, profile, firstTime } = useRootStore('user');

  if ((accessToken || DEBUG_IGNORE_TOKEN) && profile) {
    return <Outlet />;
  }
  else if (firstTime) {
    return <LoadSpinner />;
  }
  else {
    return <Navigate to={`/sign-in?error=${encodeURI('Please sign in first.')}`} />;
  }
}