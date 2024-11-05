import { type RouteObject } from 'react-router-dom';

export const homeRoute: RouteObject = {
  index: true,
  element: <Home />
}

function Home() {
  return (
    <div>Home</div>
  );
}