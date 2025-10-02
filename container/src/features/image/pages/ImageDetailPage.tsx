import { useParams } from 'react-router-dom';
import { useImageById } from '../hooks';
import { Share2, Download, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import { Textarea } from '@/shared/components/ui/textarea';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Alex Chen',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=6366f1&color=fff',
    content: 'Amazing composition! The lighting in this image is absolutely stunning.',
    timestamp: '2 hours ago',
    likes: 12,
  },
  {
    id: '2',
    author: 'Sarah Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=8b5cf6&color=fff',
    content: 'Love the color palette here. The prompt really captures the mood perfectly.',
    timestamp: '5 hours ago',
    likes: 8,
  },
  {
    id: '3',
    author: 'Mike Rodriguez',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Rodriguez&background=10b981&color=fff',
    content: 'This would make a great wallpaper! Mind sharing the settings you used?',
    timestamp: '1 day ago',
    likes: 5,
  },
];

const CommentSection = () => {
  return (
    <div className="space-y-6 sm:space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-medium">
        <MessageCircle className="h-5 w-5" />
        Comments ({mockComments.length})
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {mockComments.map((comment, index) => (
          <div key={comment.id}>
            <div className="flex gap-3 py-3 sm:gap-4 sm:py-4">
              <Avatar className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12">
                <AvatarImage src={comment.avatar} alt={comment.author} />
                <AvatarFallback>
                  {comment.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-sm font-medium sm:text-base">{comment.author}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">{comment.timestamp}</span>
                </div>
                <p className="text-foreground mb-3 text-sm leading-relaxed sm:text-base">{comment.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground h-auto p-0 text-xs hover:text-red-500 sm:text-sm"
                >
                  <Heart className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  {comment.likes} likes
                </Button>
              </div>
            </div>
            {index < mockComments.length - 1 && <Separator />}
          </div>
        ))}
      </div>

      <div>
        <Separator className="mb-4 sm:mb-6" />
        <Textarea placeholder="Add a comment..." rows={3} className="text-sm sm:text-base" />
        <div className="mt-3 flex justify-end">
          <Button className="w-full sm:w-auto">Post Comment</Button>
        </div>
      </div>
    </div>
  );
};

const ImageDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { image, isLoading } = useImageById(id);

  const handleShare = async () => {
    if (navigator.share && image) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: image.prompt,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!image) return;

    const link = document.createElement('a');
    link.href = image.url;
    link.download = `ai-image-${image.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading image...</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Image Not Found</h2>
          <p className="text-muted-foreground">The requested image could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Main Image Display */}
        <div className="mb-8 flex justify-center">
          <img
            src={image.url}
            alt={image.prompt}
            className="max-h-[60vh] max-w-full rounded-lg object-contain sm:max-h-[70vh]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
            }}
          />
        </div>

        {/* Content Container */}
        <div className="mx-auto max-w-4xl space-y-2">
          {/* Prompt */}
          <div>
            <strong className="text-xl">Prompt: </strong>
            <span className="text-foreground text-xl leading-relaxed">{image.prompt}</span>
          </div>

          {/* Action Buttons */}
          <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button onClick={handleDownload} size="lg" className="w-full gap-2 sm:w-auto">
              <Download className="h-5 w-5" />
              Download
            </Button>

            <Button onClick={handleShare} variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
              <Share2 className="h-5 w-5" />
              Share
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mx-auto max-w-4xl">
          <CommentSection />
        </div>
      </div>
    </div>
  );
};

export default ImageDetailPage;
