import React from 'react'
import { TrendingUp, Target, Calendar } from 'lucide-react'

const ActivityHeader: React.FC = () => {
  return (
    <section className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-2xl font-medium text-secondary-200">Activity</p>
        <h1 className="text-[44px] font-medium text-primary-600 leading-[66px]">Stay Active!</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="btn-primary flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Set Goal</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>View Trends</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>This Week</span>
        </button>
      </div>
    </section>
  )
}

export default ActivityHeader
