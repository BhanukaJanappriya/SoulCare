import React from 'react'
import { Users, TrendingUp, Target, ChevronDown } from 'lucide-react'

const ActivityCard: React.FC = () => {
  const activities = [
    {
      icon: Users,
      label: 'Heart rate',
      value: '130 bpm',
      color: 'bg-primary-300'
    },
    {
      icon: TrendingUp,
      label: 'Total steps',
      value: '5500',
      color: 'bg-primary-400'
    },
    {
      icon: Target,
      label: 'Game points',
      value: '534',
      color: 'bg-secondary-100'
    }
  ]

  const progressBars = [
    { label: 'Move', progress: 65, color: 'bg-blue-400' },
    { label: 'Game Points', progress: 80, color: 'bg-green-400' },
    { label: 'Steps', progress: 45, color: 'bg-purple-400' }
  ]

  return (
    <div className="bg-primary-100 rounded-2xl p-5">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-primary-500">Activity</h2>
        <div className="bg-primary-300 rounded-2xl px-3 py-2 flex items-center space-x-2">
          <span className="text-secondary-500">Week</span>
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <ChevronDown className="w-2 h-2 text-secondary-500" />
          </div>
        </div>
      </header>
      
      <div className="flex flex-wrap gap-6 mb-6">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${activity.color} rounded-full flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-primary-500">{activity.label}</p>
                <p className="text-lg font-medium text-primary-500">{activity.value}</p>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="space-y-4">
        {progressBars.map((bar, index) => (
          <div key={index} className="space-y-2">
            <p className="text-lg font-medium text-secondary-500">{bar.label}</p>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${bar.color}`}
                style={{ width: `${bar.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityCard
