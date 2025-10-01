interface SpinnerProps {
  text?: string;
}

// Spinner that overlays the entire screen
const GlobalSpinner = ({ text }: SpinnerProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
      <div className="flex h-[200px] flex-col items-center justify-center">
        <div className="border-3 h-9 w-9 animate-spin rounded-full border-blue-600 border-t-transparent" />
        <div className="mt-5 font-medium text-blue-600">{text || 'Loading data...'}</div>
      </div>
    </div>
  );
};

// Spinner that overlays only the parent container
const Spinner = ({ text }: SpinnerProps) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
      <div className="flex h-[200px] flex-col items-center justify-center">
        <div className="border-3 h-9 w-9 animate-spin rounded-full border-blue-600 border-t-transparent" />
        <div className="mt-5 font-medium text-blue-600">{text || 'Loading data...'}</div>
      </div>
    </div>
  );
};

export default GlobalSpinner;
export { Spinner };
