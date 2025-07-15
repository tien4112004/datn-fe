import Nav from '@/shared/layouts/Nav';
import { Outlet, useNavigation } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';

export default function NavLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <>
      <Nav />
      <main className="flex flex-col h-fit">
        {isLoading && <GlobalSpinner text="Loading page..." />}
        <Outlet />
      </main>
    </>
  );
}
