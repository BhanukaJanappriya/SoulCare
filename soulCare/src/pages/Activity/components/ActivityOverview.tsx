import React from 'react'
import { Footprints, Heart, Zap, Trophy } from 'lucide-react'

const ActivityOverview: React.FC = () => {
  const metrics = [
    {
      icon: Footprints,
      label: 'Steps Today',
      value: '8,547',
      goal: '10,000',
      progress: 85,
      color: 'bg-blue-500'
    },
    {
      icon: Heart,
      label: 'Heart Rate',
      value: '72 bpm',
      goal: 'Resting',
      progress: 100,
      color: 'bg-red-500'
    },
    {
      icon: Zap,
      label: 'Calories Burned',
      value: '342',
      goal: '500',
      progress: 68,
      color: 'bg-orange-500'
    },
    {
      icon: Trophy,
      label: 'Active Minutes',
      value: '45',
      goal: '60',
      progress: 75,
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="grid grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <div key={index} className="bg-primary-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-secondary-200">{metric.progress}%</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-secondary-200">{metric.label}</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-semibold text-primary-500">{metric.value}</span>
                <span className="text-sm text-secondary-200">/ {metric.goal}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${metric.color}`}
                  style={{ width: `${metric.progress}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ActivityOverview
