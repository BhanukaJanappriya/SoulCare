import React from 'react'
import { Clock, MapPin, User } from 'lucide-react'

const UpcomingAppointments: React.FC = () => {
  const appointments = [
    {
      id: 1,
      title: 'Dr. Sarah Johnson',
      type: 'General Consultation',
      date: 'Today',
      time: '10:00 AM',
      location: 'Room 205',
      avatar: 'https://static.codia.ai/custom_image/2025-07-06/144325/user-avatar.png'
    },
    {
      id: 2,
      title: 'Dr. Michael Chen',
      type: 'Therapy Session',
      date: 'Tomorrow',
      time: '2:00 PM',
      location: 'Room 301',
      avatar: 'https://static.codia.ai/custom_image/2025-07-06/144325/user-avatar.png'
    },
    {
      id: 3,
      title: 'Dr. Emily Davis',
      type: 'Follow-up',
      date: 'Friday',
      time: '11:30 AM',
      location: 'Room 102',
      avatar: 'https://static.codia.ai/custom_image/2025-07-06/144325/user-avatar.png'
    }
  ]

  return (
    <div className="bg-primary-100 rounded-2xl p-6">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-primary-500">Upcoming</h2>
        <button className="text-sm text-primary-500 hover:text-primary-600">View All</button>
      </header>
      
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={appointment.avatar} 
                    alt={appointment.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-primary-500">{appointment.title}</h3>
                  <p className="text-sm text-secondary-200">{appointment.type}</p>
                </div>
              </div>
              <span className="text-xs bg-primary-50 text-primary-500 px-2 py-1 rounded-full">
                {appointment.date}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-secondary-200">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{appointment.time}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{appointment.location}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 btn-primary text-sm py-2">Join</button>
              <button className="flex-1 btn-secondary text-sm py-2">Reschedule</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UpcomingAppointments
