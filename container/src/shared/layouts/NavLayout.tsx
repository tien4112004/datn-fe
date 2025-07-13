import Nav from '@/shared/layouts/Nav';
import { Outlet, useNavigation } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';

export default function NavLayout() {
  const navigation = useNavigation();

  console.log('Navigation state:', navigation.state);
  console.log('Navigation location:', navigation.location);

  return (
    <>
      <Nav />
      <main className="overflow-hidden flex flex-col">
        {navigation.state === 'loading' ? <GlobalSpinner /> : <Outlet />}
      </main>
    </>
  );
}
