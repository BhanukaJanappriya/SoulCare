import React from 'react'
import { Clock, Calendar, MapPin, ChevronDown, CheckSquare, FileText, BarChart3 } from 'lucide-react'

const HabitTracker: React.FC = () => {
  const habits = [
    {
      icon: CheckSquare,
      title: 'Morning run',
      time: '07:00 am',
      location: 'Park',
      duration: '45min',
      color: 'bg-secondary-100'
    },
    {
      icon: FileText,
      title: '1,5L of water daily',
      time: 'All day',
      location: 'Park',
      duration: '',
      color: 'bg-primary-300'
    },
    {
      icon: BarChart3,
      title: 'Cooking mealpreps for 3 days',
      time: '11:00 am',
      location: 'Home',
      duration: '2h',
      color: 'bg-primary-400'
    }
  ]

  return (
    <div className="bg-primary-50 rounded-2xl p-5">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-medium text-primary-500">Habit tracker</h2>
        <div className="flex items-center space-x-0">
          <div className="bg-white rounded-2xl px-3 py-1">
            <span className="text-secondary-500">Habits</span>
          </div>
          <div className="bg-primary-300 rounded-2xl px-3 py-1">
            <span className="text-secondary-500">Tasks</span>
          </div>
        </div>
      </header>
      
      <div className="space-y-5">
        {habits.map((habit, index) => {
          const Icon = habit.icon
          return (
            <div key={index}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 ${habit.color} rounded-2xl flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-primary-500">{habit.title}</h3>
                    <div className="flex items-center space-x-3 text-sm text-secondary-200">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-6 h-6" />
                        <span>{habit.time}</span>
                      </div>
                      <div className="w-1 h-1 bg-secondary-200 rounded-full" />
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-6 h-6" />
                        <span>Park</span>
                      </div>
                      {habit.duration && (
                        <>
                          <div className="w-1 h-1 bg-secondary-200 rounded-full" />
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-6 h-6" />
                            <span>{habit.duration}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button className="w-6 h-6 bg-primary-300 rounded-md flex items-center justify-center">
                  <ChevronDown className="w-3 h-3 text-primary-500" />
                </button>
              </div>
              {index < habits.length - 1 && <hr className="my-5 border-secondary-400" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HabitTracker
