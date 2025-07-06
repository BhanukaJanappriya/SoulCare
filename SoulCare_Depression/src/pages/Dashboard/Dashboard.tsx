import React from 'react'
import WelcomeSection from './components/WelcomeSection'
import MoodTracker from './components/MoodTracker'
import ActivityCard from './components/ActivityCard'
import HabitTracker from './components/HabitTracker'
import DailyProgress from './components/DailyProgress'
import MeditationCard from './components/MeditationCard'

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-10">
      <WelcomeSection />
      
      <section className="grid grid-cols-3 gap-4">
        <article className="col-span-2">
          <MoodTracker />
        </article>
        <aside>
          <ActivityCard />
        </aside>
      </section>
      
      <section className="grid grid-cols-3 gap-4">
        <article className="col-span-1">
          <HabitTracker />
        </article>
        <aside>
          <DailyProgress />
        </aside>
        <aside>
          <MeditationCard />
        </aside>
      </section>
    </div>
  )
}

export default Dashboard
