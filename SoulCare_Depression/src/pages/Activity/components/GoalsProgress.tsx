import React from 'react'

const GoalsProgress: React.FC = () => {
  const goals = [
    {
      title: 'Daily Steps',
      current: 8547,
      target: 10000,
      unit: 'steps',
      color: 'bg-blue-500'
    },
    {
      title: 'Weekly Workouts',
      current: 4,
      target: 5,
      unit: 'workouts',
      color: 'bg-green-500'
    },
    {
      title: 'Monthly Distance',
      current: 45.2,
      target: 60,
      unit: 'km',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="bg-primary-100 rounded-2xl p-6">
      <header className="mb-6">
        <h2 className="text-2xl font-medium text-primary-500">Goals Progress</h2>
        <p className="text-secondary-200 mt-1">Keep pushing towards your targets</p>
      </header>
      
      <div className="space-y-6">
        {goals.map((goal, index) => {
          const progress = (goal.current / goal.target) * 100
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-primary-500">{goal.title}</h3>
                <span className="text-sm text-secondary-200">
                  {Math.round(progress)}%
                </span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${goal.color}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-500 font-medium">
                  {typeof goal.current === 'number' && goal.current % 1 !== 0 
                    ? goal.current.toFixed(1) 
                    : goal.current.toLocaleString()} {goal.unit}
                </span>
                <span className="text-secondary-200">
                  Target: {goal.target.toLocaleString()} {goal.unit}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-white rounded-xl">
        <h3 className="font-medium text-primary-500 mb-2">Achievement Streak</h3>
        <div className="flex items-center space-x-2">
          <div className="text-3xl font-bold text-secondary-100">7</div>
          <div className="text-sm text-secondary-200">
            <p>days in a row</p>
            <p>meeting step goal</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoalsProgress
