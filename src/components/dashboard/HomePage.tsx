'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { TrendingDown, Flame, Target, Award, Calendar, MessageSquare, Activity, Scale } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

type Page = 'home' | 'chat' | 'calendar' | 'calories' | 'profile' | 'food-analyzer'

interface HomePageProps {
  user: User
  onNavigate?: (page: Page) => void
}

interface WeeklyData {
  day: string
  calories: number
  weight: number
  workouts: number
}

export default function HomePage({ user, onNavigate }: HomePageProps) {
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
  
  // Dados semanais simulados (em produção, viriam do Supabase)
  const weeklyData: WeeklyData[] = [
    { day: 'Seg', calories: 1650, weight: 78.5, workouts: 1 },
    { day: 'Ter', calories: 1720, weight: 78.3, workouts: 1 },
    { day: 'Qua', calories: 1580, weight: 78.2, workouts: 0 },
    { day: 'Qui', calories: 1800, weight: 78.0, workouts: 1 },
    { day: 'Sex', calories: 1690, weight: 77.8, workouts: 1 },
    { day: 'Sáb', calories: 1950, weight: 77.9, workouts: 0 },
    { day: 'Dom', calories: 1450, weight: 77.7, workouts: 1 },
  ]

  const maxCalories = Math.max(...weeklyData.map(d => d.calories))
  const maxWeight = Math.max(...weeklyData.map(d => d.weight))
  const minWeight = Math.min(...weeklyData.map(d => d.weight))
  const totalWorkouts = weeklyData.reduce((sum, d) => sum + d.workouts, 0)
  const avgCalories = Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length)
  const weightLost = (weeklyData[0].weight - weeklyData[weeklyData.length - 1].weight).toFixed(1)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          Olá, {userName}! 👋
        </h1>
        <p className="text-slate-600 text-lg">
          Acompanhe seu progresso semanal
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-600 p-3 rounded-xl shadow-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-emerald-700">-{weightLost}kg</span>
          </div>
          <h3 className="text-sm font-semibold text-emerald-900">Peso Perdido</h3>
          <p className="text-xs text-emerald-700 mt-1">Esta semana</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-600 p-3 rounded-xl shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-orange-700">{avgCalories}</span>
          </div>
          <h3 className="text-sm font-semibold text-orange-900">Média Diária</h3>
          <p className="text-xs text-orange-700 mt-1">Calorias/dia</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-blue-700">{totalWorkouts}</span>
          </div>
          <h3 className="text-sm font-semibold text-blue-900">Treinos</h3>
          <p className="text-xs text-blue-700 mt-1">Esta semana</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-600 p-3 rounded-xl shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-purple-700">18</span>
          </div>
          <h3 className="text-sm font-semibold text-purple-900">Sequência</h3>
          <p className="text-xs text-purple-700 mt-1">Dias consecutivos</p>
        </Card>
      </div>

      {/* Weekly Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Calories Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Calorias Consumidas</h3>
              <p className="text-sm text-slate-600">Últimos 7 dias</p>
            </div>
          </div>
          <div className="space-y-3">
            {weeklyData.map((data) => {
              const percentage = (data.calories / maxCalories) * 100
              return (
                <div key={data.day} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 w-10">{data.day}</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{data.calories}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Weight Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Evolução do Peso</h3>
              <p className="text-sm text-slate-600">Últimos 7 dias</p>
            </div>
          </div>
          <div className="space-y-3">
            {weeklyData.map((data) => {
              const percentage = ((maxWeight - data.weight) / (maxWeight - minWeight)) * 100
              return (
                <div key={data.day} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 w-10">{data.day}</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ width: `${100 - percentage}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{data.weight}kg</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Workouts Chart */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Treinos Realizados</h3>
            <p className="text-sm text-slate-600">Últimos 7 dias</p>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((data) => (
            <div key={data.day} className="flex flex-col items-center gap-2">
              <div className="text-xs font-medium text-slate-600">{data.day}</div>
              <div
                className={`w-full h-24 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                  data.workouts > 0
                    ? 'bg-gradient-to-t from-blue-600 to-blue-500 shadow-lg'
                    : 'bg-slate-200'
                }`}
              >
                {data.workouts > 0 && (
                  <span className="text-xs font-bold text-white">{data.workouts}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-teal-200">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-4 rounded-2xl shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Chat com IA Nutricional
              </h3>
              <p className="text-slate-600 mb-4">
                Tire dúvidas sobre alimentação e receba orientações personalizadas
              </p>
              <Button 
                onClick={() => onNavigate?.('chat')}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                Iniciar Conversa
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-emerald-200">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-4 rounded-2xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Treino de Hoje
              </h3>
              <p className="text-slate-600 mb-4">
                Treino de força - Nível Intermediário (45 min)
              </p>
              <Button 
                onClick={() => onNavigate?.('calendar')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                Ver Treino
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Motivational Quote */}
      <Card className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl">
        <p className="text-lg font-semibold mb-2">
          "O sucesso é a soma de pequenos esforços repetidos dia após dia."
        </p>
        <p className="text-sm opacity-90">- Robert Collier</p>
      </Card>
    </div>
  )
}
