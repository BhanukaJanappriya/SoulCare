import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  Mail, 
  Bell, 
  MessageCircle, 
  Settings,
  User
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const location = useLocation()

  const menuItems = [
    { icon: Home, path: '/', label: 'Dashboard' },
    { icon: FileText, path: '/appointments', label: 'Appointments' },
    { icon: Mail, path: '/mail', label: 'Mail' },
    { icon: Bell, path: '/notifications', label: 'Notifications' },
    { icon: MessageCircle, path: '/activity', label: 'Activity' },
  ]

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-20 bg-primary-500 rounded-[20px] flex flex-col items-center py-8 z-10">
      <nav className="flex flex-col items-center space-y-4 flex-1">
        <div className="w-12 h-12 bg-white bg-opacity-15 rounded-full flex items-center justify-center mb-4">
          <User className="sidebar-icon" />
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isActive 
                  ? 'bg-white bg-opacity-15' 
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              aria-label={item.label}
            >
              <Icon className="sidebar-icon" />
            </Link>
          )
        })}
      </nav>
      
      <div className="w-6 h-6 rounded-md overflow-hidden">
        <Settings className="sidebar-icon" />
      </div>
    </aside>
  )
}

export default Sidebar
