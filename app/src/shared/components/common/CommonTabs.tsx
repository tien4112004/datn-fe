import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';

export interface TabItem {
  key: string;
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface CommonTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: TabItem[];
  tabsListClassName?: string;
  tabsClassName?: string;
  tabsContentClassName?: string;
}

const CommonTabs = ({
  value,
  onValueChange,
  items,
  tabsListClassName = '',
  tabsClassName = '',
  tabsContentClassName = '',
}: CommonTabsProps) => (
  <Tabs value={value} onValueChange={onValueChange} className={tabsClassName}>
    <TabsList className={tabsListClassName}>
      {items.map((item) => (
        <TabsTrigger
          key={item.key}
          value={item.value}
          className="data-[state=active]:border-b-primary h-full w-fit flex-none rounded-none border-b-2 border-transparent data-[state=active]:shadow-none"
        >
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {items.map((item) => (
      <TabsContent key={item.key} value={item.value} className={tabsContentClassName}>
        {item.content}
      </TabsContent>
    ))}
  </Tabs>
);

export default CommonTabs;
