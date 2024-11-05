import { type RouteObject } from 'react-router-dom';

export const profileRoute: RouteObject = {
  path: '/profile',
  element: <Profile />
}

function Profile() {
  return (
    <div>Profile</div>
  );
}