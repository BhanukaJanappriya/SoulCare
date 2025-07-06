import React from 'react'
import { Play, MoreHorizontal } from 'lucide-react'

const MeditationCard: React.FC = () => {
  return (
    <div className="bg-primary-200 rounded-2xl p-5 relative overflow-hidden">
      <header className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-medium text-primary-500">Meditation</h2>
        <button>
          <MoreHorizontal className="w-4 h-4 text-primary-500" />
        </button>
      </header>
      
      <div className="relative h-64 mb-6">
        <div className="absolute inset-0">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/planet-background.svg" 
            alt="Meditation background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/planet-surface.png" 
            alt="Planet surface" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/landscape-base.png" 
            alt="Landscape base" 
            className="absolute bottom-0 left-0 w-full h-16 object-cover"
          />
        </div>
        
        {/* Stars */}
        <div className="absolute top-8 left-20">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/star-icon-1.svg" 
            alt="Star" 
            className="w-4 h-4"
          />
        </div>
        <div className="absolute top-6 left-16">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/small-star-icon.svg" 
            alt="Small star" 
            className="w-2 h-2"
          />
        </div>
        <div className="absolute top-2 right-8">
          <img 
            src="https://static.codia.ai/custom_image/2025-07-06/144325/star-icon-2.svg" 
            alt="Star" 
            className="w-4 h-4"
          />
        </div>
        
        {/* Play button */}
        <div className="absolute bottom-8 right-8">
          <button className="w-18 h-18 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Play className="w-4 h-5 text-primary-500 ml-0.5" />
            </div>
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-primary-500">Good vibes, good life</h3>
        <p className="text-primary-500">Positive thinking | 27min</p>
      </div>
    </div>
  )
}

export default MeditationCard
