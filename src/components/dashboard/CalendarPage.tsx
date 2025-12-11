'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Dumbbell, Clock, TrendingUp, CheckCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CalendarPageProps {
  user: User
}

type WorkoutLevel = 'beginner' | 'easy' | 'intermediate' | 'advanced'

interface Workout {
  id: string
  title: string
  level: WorkoutLevel
  duration: number
  calories: number
  exercises: string[]
}

const workouts: Record<WorkoutLevel, Workout[]> = {
  beginner: [
    {
      id: '1',
      title: 'Caminhada Leve',
      level: 'beginner',
      duration: 20,
      calories: 100,
      exercises: ['Caminhada 20 min', 'Alongamento 5 min'],
    },
    {
      id: '2',
      title: 'Exercícios Básicos',
      level: 'beginner',
      duration: 25,
      calories: 120,
      exercises: ['10 Agachamentos', '10 Flexões (joelhos)', '15 Abdominais', 'Prancha 20s'],
    },
  ],
  easy: [
    {
      id: '3',
      title: 'Cardio Leve',
      level: 'easy',
      duration: 30,
      calories: 180,
      exercises: ['Corrida leve 15 min', 'Polichinelos 3x20', 'Burpees 3x10'],
    },
    {
      id: '4',
      title: 'Força Iniciante',
      level: 'easy',
      duration: 35,
      calories: 200,
      exercises: ['15 Agachamentos', '12 Flexões', '20 Abdominais', 'Prancha 30s', '3 séries'],
    },
  ],
  intermediate: [
    {
      id: '5',
      title: 'HIIT Intermediário',
      level: 'intermediate',
      duration: 40,
      calories: 300,
      exercises: ['Burpees 4x15', 'Mountain climbers 4x20', 'Jump squats 4x15', 'Descanso 30s'],
    },
    {
      id: '6',
      title: 'Força Completa',
      level: 'intermediate',
      duration: 45,
      calories: 320,
      exercises: ['20 Agachamentos', '15 Flexões', '25 Abdominais', 'Prancha 45s', '4 séries'],
    },
  ],
  advanced: [
    {
      id: '7',
      title: 'HIIT Avançado',
      level: 'advanced',
      duration: 50,
      calories: 450,
      exercises: ['Burpees 5x20', 'Box jumps 5x15', 'Kettlebell swings 5x20', 'Sprint 5x30s'],
    },
    {
      id: '8',
      title: 'Força Intensa',
      level: 'advanced',
      duration: 60,
      calories: 500,
      exercises: ['30 Agachamentos', '25 Flexões', '40 Abdominais', 'Prancha 90s', '5 séries'],
    },
  ],
}

const levelLabels: Record<WorkoutLevel, string> = {
  beginner: 'Iniciante',
  easy: 'Fácil',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
}

const levelColors: Record<WorkoutLevel, string> = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  easy: 'bg-blue-100 text-blue-700 border-blue-200',
  intermediate: 'bg-orange-100 text-orange-700 border-orange-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
}

export default function CalendarPage({ user }: CalendarPageProps) {
  const [selectedLevel, setSelectedLevel] = useState<WorkoutLevel>('intermediate')
  const [userLevel, setUserLevel] = useState<WorkoutLevel | null>(null)
  const [loading, setLoading] = useState(true)
  const [completingWorkout, setCompletingWorkout] = useState<string | null>(null)
  const [currentMonth] = useState(new Date())

  useEffect(() => {
    loadUserProfile()
  }, [user])

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('workout_level')
        .eq('user_id', user.id)
        .single()

      if (data && data.workout_level) {
        setUserLevel(data.workout_level as WorkoutLevel)
        setSelectedLevel(data.workout_level as WorkoutLevel)
      }
    } catch (error) {
      // Erro ao carregar perfil - tratado silenciosamente
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteWorkout = async (workout: Workout) => {
    setCompletingWorkout(workout.id)
    try {
      const { error } = await supabase.from('workouts').insert({
        user_id: user.id,
        title: workout.title,
        level: workout.level,
        duration: workout.duration,
        calories_burned: workout.calories,
        exercises: workout.exercises,
      })

      if (error) throw error

      alert('✅ Treino concluído com sucesso!')
    } catch (error) {
      alert('Erro ao salvar treino. Tente novamente.')
    } finally {
      setCompletingWorkout(null)
    }
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth()
  const today = new Date().getDate()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Planos de Treino
        </h1>
        <p className="text-gray-600 text-lg">
          {userLevel
            ? `Seu nível: ${levelLabels[userLevel]} • Escolha um treino e comece agora!`
            : 'Escolha seu nível e acompanhe seus treinos diários'}
        </p>
      </div>

      {/* Level Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {(Object.keys(levelLabels) as WorkoutLevel[]).map((level) => {
          const isRecommended = level === userLevel
          return (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 relative ${
                selectedLevel === level
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Recomendado
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp
                  className={`w-5 h-5 ${
                    selectedLevel === level ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                />
              </div>
              <p
                className={`font-semibold text-sm ${
                  selectedLevel === level ? 'text-emerald-700' : 'text-gray-700'
                }`}
              >
                {levelLabels[level]}
              </p>
            </button>
          )
        })}
      </div>

      {/* Calendar */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const isToday = day === today
            const hasWorkout = day <= today

            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                  isToday
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                    : hasWorkout
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                {day}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Workouts List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Treinos - {levelLabels[selectedLevel]}
        </h2>

        {workouts[selectedLevel].map((workout) => (
          <Card key={workout.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{workout.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={levelColors[workout.level]}>
                      {levelLabels[workout.level]}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {workout.duration} min
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      🔥 {workout.calories} kcal
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleCompleteWorkout(workout)}
                disabled={completingWorkout === workout.id}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 w-full md:w-auto"
              >
                {completingWorkout === workout.id ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Concluir Treino
                  </>
                )}
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Exercícios:</h4>
              <ul className="space-y-2">
                {workout.exercises.map((exercise, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    {exercise}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
