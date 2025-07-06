import React from 'react'
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

const AppointmentStats: React.FC = () => {
  const stats = [
    {
      icon: Calendar,
      label: 'Total Appointments',
      value: '24',
      change: '+12%',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: '18',
      change: '+8%',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Clock,
      label: 'Pending',
      value: '4',
      change: '+2',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: XCircle,
      label: 'Cancelled',
      value: '2',
      change: '-1',
      color: 'bg-red-100 text-red-600'
    }
  ]

  return (
    <div className="bg-primary-50 rounded-2xl p-6">
      <header className="mb-6">
        <h2 className="text-2xl font-medium text-primary-500">Appointment Statistics</h2>
        <p className="text-secondary-200 mt-1">This month overview</p>
      </header>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary-500">{stat.value}</p>
                <p className="text-sm text-secondary-200">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-white rounded-xl">
        <h3 className="font-medium text-primary-500 mb-3">Weekly Trend</h3>
        <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="flex flex-col items-center space-y-2">
              <div 
                className="w-6 bg-primary-300 rounded-t"
                style={{ height: `${Math.random() * 60 + 20}px` }}
              />
              <span className="text-xs text-secondary-200">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AppointmentStats
