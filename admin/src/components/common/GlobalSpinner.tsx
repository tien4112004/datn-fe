interface SpinnerProps {
  text?: string;
}

// Full-screen overlay spinner used for lazy loading pages
const GlobalSpinner = ({ text }: SpinnerProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
      <div className="flex h-[200px] flex-col items-center justify-center">
        <div className="border-3 h-9 w-9 animate-spin rounded-full border-blue-600 border-t-transparent" />
        <div className="mt-5 font-medium text-blue-600">{text || 'Loading...'}</div>
      </div>
    </div>
  );
};

export default GlobalSpinner;
