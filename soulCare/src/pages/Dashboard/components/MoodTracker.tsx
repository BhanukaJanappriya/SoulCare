import React from 'react'
import { ChevronDown } from 'lucide-react'

const MoodTracker: React.FC = () => {
  const months = [
    { name: 'Jan', height: 136 },
    { name: 'Feb', height: 91 },
    { name: 'Mar', height: 153 },
    { name: 'Apr', height: 120 },
    { name: 'May', height: 91 },
    { name: 'Jun', height: 136 },
    { name: 'Jul', height: 153 },
    { name: 'Sep', height: 197, active: true },
    { name: 'Aug', height: 120 },
    { name: 'Oct', height: 161 },
    { name: 'Nov', height: 86 },
    { name: 'Dec', height: 120 }
  ]

  const yAxisLabels = ['2000', '1000', '500', '100', '0']

  return (
    <div className="bg-primary-50 rounded-2xl p-5">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-primary-500">Mood Tracker</h2>
        <div className="bg-primary-300 rounded-2xl px-3 py-2 flex items-center space-x-2">
          <span className="text-secondary-500">Month</span>
          <div className="w-4 h-4 bg-primary-50 rounded-full flex items-center justify-center">
            <ChevronDown className="w-2 h-2 text-secondary-500" />
          </div>
        </div>
      </header>
      
      <div className="relative h-[233px] flex items-end justify-between pl-9 pr-4">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-secondary-300">
          {yAxisLabels.map((label, index) => (
            <span key={index} className="text-right">{label}</span>
          ))}
        </div>
        
        <div className="absolute top-5 left-14 right-4 h-px">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/chart-line.svg" 
            alt="Chart trend line" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex items-end justify-between w-full ml-14 space-x-4">
          {months.map((month, index) => (
            <div key={index} className="flex flex-col items-center space-y-3">
              <div 
                className={`w-8 rounded-[18px] ${
                  month.active ? 'bg-secondary-100' : 'bg-primary-300'
                }`}
                style={{ height: `${month.height}px` }}
              />
              <span className={`text-base ${
                month.active ? 'text-secondary-500 font-medium' : 'text-secondary-200'
              }`}>
                {month.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MoodTracker
