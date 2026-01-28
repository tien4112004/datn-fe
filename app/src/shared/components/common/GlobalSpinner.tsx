interface SpinnerProps {
  text?: string;
  lightBlur?: boolean;
}

const SpinnerIcon = ({ size = 36 }: { size?: number }) => {
  const segments = 12;
  const segmentWidth = 2;

  return (
    <svg className="animate-spin text-blue-600" viewBox="0 0 50 50" height={size} width={size}>
      {[...Array(segments)].map((_, index) => (
        <rect
          key={index}
          x="23.5"
          y="5"
          width={String(segmentWidth)}
          height="10"
          rx="1"
          ry="1"
          fill="currentColor"
          transform={`rotate(${index * (360 / segments)} 25 25)`}
          opacity={1 - (index * 0.75) / segments}
        />
      ))}
    </svg>
  );
};

// Spinner that overlays the entire screen
const GlobalSpinner = ({ text, lightBlur = false }: SpinnerProps) => {
  const blurClass = lightBlur ? 'bg-white/30 backdrop-blur-[1px]' : 'bg-white/50 backdrop-blur-sm';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center ${blurClass}`}>
      <div className="flex h-[200px] flex-col items-center justify-center">
        <SpinnerIcon size={36} />
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
        <SpinnerIcon size={36} />
        <div className="mt-5 font-medium text-blue-600">{text || 'Loading data...'}</div>
      </div>
    </div>
  );
};

export default GlobalSpinner;
export { Spinner };
