'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  TrendingDown, 
  User as UserIcon, 
  LogOut,
  Menu,
  X,
  Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import HomePage from './HomePage'
import ChatPage from './ChatPage'
import CalendarPage from './CalendarPage'
import CaloriesPage from './CaloriesPage'
import ProfilePage from './ProfilePage'
import FoodAnalyzer from './FoodAnalyzer'

interface DashboardProps {
  user: User
}

type Page = 'home' | 'chat' | 'calendar' | 'calories' | 'profile' | 'food-analyzer'

export default function Dashboard({ user }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  const menuItems = [
    { id: 'home' as Page, label: 'Início', icon: Home },
    { id: 'chat' as Page, label: 'Chat IA', icon: MessageSquare },
    { id: 'calendar' as Page, label: 'Treinos', icon: Calendar },
    { id: 'food-analyzer' as Page, label: 'Analisar Prato', icon: Camera },
    { id: 'calories' as Page, label: 'Calorias', icon: TrendingDown },
    { id: 'profile' as Page, label: 'Perfil', icon: UserIcon },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage user={user} onNavigate={handleNavigate} />
      case 'chat':
        return <ChatPage user={user} />
      case 'calendar':
        return <CalendarPage user={user} />
      case 'food-analyzer':
        return <FoodAnalyzer user={user} />
      case 'calories':
        return <CaloriesPage user={user} />
      case 'profile':
        return <ProfilePage user={user} />
      default:
        return <HomePage user={user} onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            FitLife
          </h1>
          <p className="text-sm text-slate-600 mt-1">Seu assistente fitness</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            FitLife
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0 bg-slate-50">
        {renderPage()}
      </main>
    </div>
  )
}
