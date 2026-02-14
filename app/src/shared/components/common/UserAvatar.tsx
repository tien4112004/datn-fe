import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/shared/lib/utils';

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar = ({ src, name, size = 'md', className }: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // Generate initials
  const initials = name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={src} alt={name} className="object-cover" />
      <AvatarFallback className={cn('bg-blue-500 font-medium text-white', textSizeClasses[size])}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
