import type { LucideIcon } from 'lucide-react';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  gradient: string;
}

export type ProjectType = 'image' | 'presentation' | 'mindmap' | 'document';

export interface RecentProject {
  id: string;
  title: string;
  type: ProjectType;
  timestamp: string;
  route: string;
  thumbnail?: string | null;
}

export interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp?: Date;
}
