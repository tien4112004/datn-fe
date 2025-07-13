import Nav from '@/shared/layouts/Nav';
import { Outlet } from 'react-router-dom';
// .main-content {
//   flex: 1;
//   min-height: 0;
//   overflow: hidden;
// }
export default function NavLayout() {
  return (
    <>
      <Nav />
      <main className="overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </>
  );
}
