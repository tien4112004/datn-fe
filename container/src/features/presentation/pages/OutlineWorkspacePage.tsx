import OutlineWorkspace from '@/features/presentation/components/OutlineWorkspace';
import { usePresentationOutlines } from '../hooks/useApi';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Palette } from 'lucide-react';

const OutlineWorkspacePage = () => {
  const { outlineItems, setOutlineItems } = usePresentationOutlines();

  return (
    <>
      <SidebarTrigger className="absolute left-4 top-4 z-50" />
      <div className="flex min-h-[calc(100vh-1rem)] w-full max-w-3xl flex-col items-center justify-center self-center p-8">
        <div className="flex w-full flex-row gap-2">
          <div>Prompt</div>
          <div>Outline</div>
        </div>
        <div className="flex flex-col gap-4">
          <OutlineWorkspace
            items={outlineItems}
            setItems={setOutlineItems}
            onDownload={async () => {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }}
          />
          <div className="scroll-m-20 text-xl font-semibold tracking-tight">Customize your presentation</div>
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Use one of our popular themes below or view more</CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm" className="shadow-none">
                  <Palette className="h-4 w-4" />
                  View more
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="grid"></div>
            </CardContent>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Use one of our popular themes below or view more</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OutlineWorkspacePage;
