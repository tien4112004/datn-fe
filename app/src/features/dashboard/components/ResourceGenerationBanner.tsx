import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ResourceGenerationBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-6 text-white shadow-lg sm:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <h3 className="text-lg font-semibold sm:text-xl">Generate Teaching Resources with AI</h3>
          </div>
          <p className="text-sm text-white/90 sm:text-base">
            Create quizzes, worksheets, and lesson plans instantly using AI
          </p>
        </div>

        <Button
          size="lg"
          variant="secondary"
          className="group w-full gap-2 bg-white text-purple-600 hover:bg-white/90 sm:w-auto"
          onClick={() => navigate('/presentation/generate')}
        >
          Generate Now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
};
