const GlobalSpinner: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex h-[200px] flex-col items-center justify-center">
        <div className="border-3 h-9 w-9 animate-spin rounded-full border-blue-600 border-t-transparent" />
        <div className="mt-5 font-medium text-blue-600">{text || 'Loading data...'}</div>
      </div>
    </div>
  );
};

export default GlobalSpinner;
