import { type RouteObject } from 'react-router-dom';

export const signupRoute: RouteObject = {
  path: '/sign-up',
  element: <SignUp />
}

function SignUp() {
  return (
    <div>SignUp</div>
  );
}