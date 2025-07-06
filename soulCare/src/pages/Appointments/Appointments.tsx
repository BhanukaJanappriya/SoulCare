import React from 'react'
import AppointmentHeader from './components/AppointmentHeader'
import AppointmentCalendar from './components/AppointmentCalendar'
import UpcomingAppointments from './components/UpcomingAppointments'
import AppointmentStats from './components/AppointmentStats'

const Appointments: React.FC = () => {
  return (
    <div className="space-y-10">
      <AppointmentHeader />
      
      <section className="grid grid-cols-3 gap-6">
        <article className="col-span-2">
          <AppointmentCalendar />
        </article>
        <aside>
          <UpcomingAppointments />
        </aside>
      </section>
      
      <section className="grid grid-cols-2 gap-6">
        <article>
          <AppointmentStats />
        </article>
        <aside>
          <div className="bg-primary-50 rounded-2xl p-6">
            <h2 className="text-2xl font-medium text-primary-500 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full btn-primary text-left">Schedule New Appointment</button>
              <button className="w-full btn-secondary text-left">View All Appointments</button>
              <button className="w-full btn-secondary text-left">Reschedule Appointment</button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default Appointments
