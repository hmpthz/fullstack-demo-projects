import { type RouteObject } from 'react-router-dom';

export const aboutRoute: RouteObject = {
  path: '/about',
  element: <About />
}

function About() {
  return (
    <div>About</div>
  );
}