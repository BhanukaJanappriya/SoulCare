import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const AppointmentCalendar: React.FC = () => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  
  const appointments = [
    { day: 15, time: '10:00 AM', title: 'Dr. Smith - Consultation', type: 'medical' },
    { day: 18, time: '2:00 PM', title: 'Therapy Session', type: 'therapy' },
    { day: 22, time: '11:30 AM', title: 'Follow-up Appointment', type: 'followup' },
    { day: 25, time: '3:00 PM', title: 'Wellness Check', type: 'wellness' }
  ]

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-red-100 text-red-600'
      case 'therapy': return 'bg-blue-100 text-blue-600'
      case 'followup': return 'bg-green-100 text-green-600'
      case 'wellness': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="bg-primary-50 rounded-2xl p-6">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-primary-500">Calendar</h2>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-primary-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-primary-500" />
          </button>
          <span className="text-lg font-medium text-primary-500">{currentMonth}</span>
          <button className="p-2 hover:bg-primary-100 rounded-lg">
            <ChevronRight className="w-5 h-5 text-primary-500" />
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-secondary-200 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }, (_, index) => {
          const day = index - 5 + 1
          const hasAppointment = appointments.find(apt => apt.day === day)
          
          return (
            <div key={index} className="aspect-square p-2 relative">
              {day > 0 && day <= 31 && (
                <>
                  <div className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-sm ${
                    day === currentDate.getDate() 
                      ? 'bg-primary-500 text-white' 
                      : 'hover:bg-primary-100 text-primary-500'
                  }`}>
                    <span className="font-medium">{day}</span>
                  </div>
                  {hasAppointment && (
                    <div className={`absolute bottom-1 left-1 right-1 text-xs p-1 rounded ${getAppointmentColor(hasAppointment.type)}`}>
                      <div className="truncate">{hasAppointment.time}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AppointmentCalendar
