import { CardsActivityGoal } from '@/components/cards/activity-goal';
import { CardsCalendar } from '@/components/cards/calendar';
import { CardsChat } from '@/components/cards/chat';
import { CardsCookieSettings } from '@/components/cards/cookie-settings';
import { CardsCreateAccount } from '@/components/cards/create-account';
import { CardsExerciseMinutes } from '@/components/cards/exercise-minutes';
import { CardsForms } from '@/components/cards/forms';
import { CardsPayments } from '@/components/cards/payments';
import { CardsReportIssue } from '@/components/cards/report-issue';
import { CardsShare } from '@/components/cards/share';
import { CardsStats } from '@/components/cards/stats';
import { CardsTeamMembers } from '@/components/cards/team-members';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { Separator } from '@radix-ui/react-separator';
// import { SidebarTrigger } from '../ui/sidebar';
import { useApi } from '@/features/demo/hooks/useApi';
import { Button } from '@ui/button';

export default function CardsDemo() {
  const { isLoading, refetch } = useApi();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        {/* <SidebarTrigger className="-ml-1" /> */}
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Demo</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>This is just demo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex items-center justify-between p-4">
        <Button
          onClick={() => {
            refetch();
          }}
        >
          {isLoading ? 'Fetching...' : 'Fetch Demo Items'}
        </Button>
      </div>
      <div className="md:grids-col-2 **:data-[slot=card]:shadow-none grid md:gap-4 lg:grid-cols-10 xl:grid-cols-11">
        <div className="grid gap-4 lg:col-span-4 xl:col-span-6">
          <CardsStats />
          <div className="grid gap-1 sm:grid-cols-[auto_1fr] md:hidden">
            <CardsCalendar />
            <div className="pt-3 sm:pl-2 sm:pt-0 xl:pl-4">
              <CardsActivityGoal />
            </div>
            <div className="pt-3 sm:col-span-2 xl:pt-4">
              <CardsExerciseMinutes />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="flex flex-col gap-4">
              <CardsForms />
              <CardsTeamMembers />
              <CardsCookieSettings />
            </div>
            <div className="flex flex-col gap-4">
              <CardsCreateAccount />
              <CardsChat />
              <div className="hidden xl:block">
                <CardsReportIssue />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-6 xl:col-span-5">
          <div className="hidden gap-1 sm:grid-cols-[auto_1fr] md:grid">
            <CardsCalendar />
            <div className="pt-3 sm:pl-2 sm:pt-0 xl:pl-3">
              <CardsActivityGoal />
            </div>
            <div className="pt-3 sm:col-span-2 xl:pt-3">
              <CardsExerciseMinutes />
            </div>
          </div>
          <div className="hidden md:block">
            <CardsPayments />
          </div>
          <CardsShare />
          <div className="xl:hidden">
            <CardsReportIssue />
          </div>
        </div>
      </div>
    </>
  );
}
