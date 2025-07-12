import { Outlet } from 'react-router-dom';
import Nav from '@/shared/layouts/Nav';

export default function App() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
}
