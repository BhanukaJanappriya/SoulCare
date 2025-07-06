import React from 'react'
import { Calendar, Plus, Filter } from 'lucide-react'

const AppointmentHeader: React.FC = () => {
  return (
    <section className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-2xl font-medium text-secondary-200">Appointments</p>
        <h1 className="text-[44px] font-medium text-primary-600 leading-[66px]">Your Schedule</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Appointment</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filter</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>This Week</span>
        </button>
      </div>
    </section>
  )
}

export default AppointmentHeader
