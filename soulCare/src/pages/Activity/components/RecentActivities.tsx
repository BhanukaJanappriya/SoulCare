import React from 'react'
import { MapPin, Clock, Zap } from 'lucide-react'

const RecentActivities: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'Running',
      duration: '32 min',
      distance: '5.2 km',
      calories: 280,
      location: 'Central Park',
      time: '2 hours ago',
      icon: '🏃‍♂️'
    },
    {
      id: 2,
      type: 'Cycling',
      duration: '45 min',
      distance: '12.8 km',
      calories: 320,
      location: 'Riverside Trail',
      time: '1 day ago',
      icon: '🚴‍♂️'
    },
    {
      id: 3,
      type: 'Swimming',
      duration: '28 min',
      distance: '1.2 km',
      calories: 240,
      location: 'Community Pool',
      time: '2 days ago',
      icon: '🏊‍♂️'
    },
    {
      id: 4,
      type: 'Yoga',
      duration: '60 min',
      distance: '0 km',
      calories: 180,
      location: 'Home',
      time: '3 days ago',
      icon: '🧘‍♀️'
    }
  ]

  return (
    <div className="bg-primary-50 rounded-2xl p-6">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-primary-500">Recent Activities</h2>
        <button className="text-sm text-primary-500 hover:text-primary-600">View All</button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{activity.icon}</div>
                <div>
                  <h3 className="font-medium text-primary-500">{activity.type}</h3>
                  <p className="text-xs text-secondary-200">{activity.time}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-secondary-200" />
                  <span className="text-secondary-200">{activity.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-secondary-200" />
                  <span className="text-secondary-200">{activity.calories} cal</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-secondary-200" />
                  <span className="text-secondary-200">{activity.location}</span>
                </div>
                <span className="text-primary-500 font-medium">{activity.distance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivities
