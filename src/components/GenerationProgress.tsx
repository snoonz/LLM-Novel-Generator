interface GenerationProgressProps {
    currentStep: string;
    progress: number;
  }
  
  export default function GenerationProgress({ currentStep, progress }: GenerationProgressProps) {
    return (
      <div className="mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">{currentStep}</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }