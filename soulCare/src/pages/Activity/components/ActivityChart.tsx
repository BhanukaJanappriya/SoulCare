import React from 'react'
import { ChevronDown } from 'lucide-react'

const ActivityChart: React.FC = () => {
  const weekData = [
    { day: 'Mon', steps: 8500, calories: 320 },
    { day: 'Tue', steps: 9200, calories: 380 },
    { day: 'Wed', steps: 7800, calories: 290 },
    { day: 'Thu', steps: 10500, calories: 420 },
    { day: 'Fri', steps: 9800, calories: 390 },
    { day: 'Sat', steps: 11200, calories: 450 },
    { day: 'Sun', steps: 8900, calories: 350 }
  ]

  const maxSteps = Math.max(...weekData.map(d => d.steps))

  return (
    <div className="bg-primary-50 rounded-2xl p-6">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-primary-500">Weekly Activity</h2>
        <div className="flex items-center space-x-4">
          <div className="bg-primary-300 rounded-2xl px-3 py-2 flex items-center space-x-2">
            <span className="text-secondary-500">Steps</span>
            <ChevronDown className="w-4 h-4 text-secondary-500" />
          </div>
          <div className="bg-primary-300 rounded-2xl px-3 py-2 flex items-center space-x-2">
            <span className="text-secondary-500">7 Days</span>
            <ChevronDown className="w-4 h-4 text-secondary-500" />
          </div>
        </div>
      </header>
      
      <div className="h-64 flex items-end justify-between space-x-4">
        {weekData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center space-y-3">
            <div className="w-full flex flex-col items-center space-y-2">
              <div 
                className="w-8 bg-primary-400 rounded-t-lg"
                style={{ height: `${(data.steps / maxSteps) * 180}px` }}
              />
              <div 
                className="w-6 bg-secondary-100 rounded-t-lg"
                style={{ height: `${(data.calories / 500) * 120}px` }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-primary-500">{data.steps.toLocaleString()}</p>
              <p className="text-xs text-secondary-200">{data.day}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center space-x-6 mt-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary-400 rounded-full" />
          <span className="text-sm text-secondary-200">Steps</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-secondary-100 rounded-full" />
          <span className="text-sm text-secondary-200">Calories</span>
        </div>
      </div>
    </div>
  )
}

export default ActivityChart
