import React from 'react'
import ActivityHeader from './components/ActivityHeader'
import ActivityOverview from './components/ActivityOverview'
import ActivityChart from './components/ActivityChart'
import GoalsProgress from './components/GoalsProgress'
import RecentActivities from './components/RecentActivities'

const Activity: React.FC = () => {
  return (
    <div className="space-y-10">
      <ActivityHeader />
      
      <section className="grid grid-cols-4 gap-6">
        <div className="col-span-4">
          <ActivityOverview />
        </div>
      </section>
      
      <section className="grid grid-cols-3 gap-6">
        <article className="col-span-2">
          <ActivityChart />
        </article>
        <aside>
          <GoalsProgress />
        </aside>
      </section>
      
      <section>
        <RecentActivities />
      </section>
    </div>
  )
}

export default Activity
