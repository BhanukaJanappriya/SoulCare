import React from 'react'

const DailyProgress: React.FC = () => {
  return (
    <div className="bg-primary-100 rounded-2xl p-5 text-center">
      <h2 className="text-2xl font-medium text-primary-500 mb-5">Daily progress</h2>
      
      <div className="relative w-48 h-48 mx-auto mb-3">
        <div className="absolute inset-0 rounded-full bg-gray-200">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/circular-progress-background.svg" 
            alt="Progress background" 
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-medium text-primary-500 mb-1">85%</div>
          </div>
        </div>
        <div className="absolute inset-0">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/circular-progress-segment-1.png" 
            alt="Progress segment 1" 
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-0">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/circular-progress-segment-2.png" 
            alt="Progress segment 2" 
            className="w-full h-full"
          />
        </div>
      </div>
      
      <p className="text-secondary-200 leading-7">
        Keep working on your nutrition and sleep
      </p>
    </div>
  )
}

export default DailyProgress
