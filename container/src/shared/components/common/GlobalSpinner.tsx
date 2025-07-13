const GlobalSpinner: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center justify-center w-[200px] h-[200px]">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="mt-5 text-blue-600 font-medium">{text || 'Loading...'}</div>
      </div>
    </div>
  );
};

export default GlobalSpinner;
