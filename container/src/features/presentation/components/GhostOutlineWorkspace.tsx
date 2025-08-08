import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OutlineItem } from "@/features/presentation/types";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

const GhostOutlineWorkspace = ({ items } : GhostOutlineWorkspaceProps) => {
  return (
    <div className="bg-card w-3xl flex flex-col gap-6 rounded-xl p-8">
      {items.map((item, index) => (
        <Card key={item.id} className='border-primary group relative flex min-h-24 w-full flex-row gap-4 p-0 shadow-md transition-shadow duration-300 hover:shadow-lg'>
          <CardHeader className="bg-accent w-24 rounded-l-xl p-2 text-center">
            <CardTitle>{index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="flex-start flex-1 p-2">
            <div dangerouslySetInnerHTML={{ __html: item.htmlContent }} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type GhostOutlineWorkspaceProps = {
  items: OutlineItem[];
};

export default GhostOutlineWorkspace;