import React from 'react'
import { Filter, Calendar, ChevronDown } from 'lucide-react'

const WelcomeSection: React.FC = () => {
  return (
    <section className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-2xl font-medium text-secondary-200">Dashboard</p>
        <h1 className="text-[44px] font-medium text-primary-600 leading-[66px]">Hi, Bhanuka!</h1>
      </div>
      
      <div className="flex items-end space-x-3">
        <div className="bg-primary-300 rounded-[56px] px-3 py-2 flex items-center space-x-3">
          <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center">
            <Filter className="w-5 h-5 text-primary-500" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-secondary-500 font-normal">May 03 - May 18</span>
            <ChevronDown className="w-4 h-4 text-secondary-500" />
          </div>
        </div>
        
        <div className="bg-primary-300 rounded-[56px] px-3 py-2 flex items-center space-x-3">
          <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-500" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-secondary-500 font-normal">24h</span>
            <ChevronDown className="w-4 h-4 text-secondary-500" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default WelcomeSection
