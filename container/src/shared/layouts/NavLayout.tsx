// DEPRECATED: This file is no longer in use.

import Nav from '@/shared/layouts/Nav';
import { Outlet, useNavigation } from 'react-router-dom';
import GlobalSpinner from '@/components/common/GlobalSpinner';
import { useTranslation } from 'react-i18next';

export default function NavLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const { t } = useTranslation('loading');

  return (
    <>
      <Nav />
      <main className="flex flex-col h-fit">
        {isLoading && <GlobalSpinner text={t('page')} />}
        <Outlet />
      </main>
    </>
  );
}
