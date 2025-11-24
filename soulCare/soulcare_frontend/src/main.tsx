import React from 'react'
import ReactDOM from 'react-dom/client'
import i18n from './i18n'; 
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster.tsx'
import { ThemeProvider } from './components/theme-provider/theme-provider.tsx'


const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Wrap AuthProvider with ThemeProvider */}
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)