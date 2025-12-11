'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Plus, Trash2, Apple, Coffee, Utensils, Moon, TrendingUp, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CaloriesPageProps {
  user: User
}

interface Meal {
  id: string
  name: string
  calories: number
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  time: string
}

const mealIcons = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snack: Apple,
}

const mealLabels = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
}

const mealColors = {
  breakfast: 'from-amber-500 to-orange-500',
  lunch: 'from-emerald-500 to-teal-500',
  dinner: 'from-indigo-500 to-purple-500',
  snack: 'from-pink-500 to-rose-500',
}

export default function CaloriesPage({ user }: CaloriesPageProps) {
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Omelete com queijo',
      calories: 320,
      type: 'breakfast',
      time: '08:00',
    },
    {
      id: '2',
      name: 'Frango grelhado com arroz integral',
      calories: 550,
      type: 'lunch',
      time: '12:30',
    },
    {
      id: '3',
      name: 'Iogurte com granola',
      calories: 180,
      type: 'snack',
      time: '15:00',
    },
    {
      id: '4',
      name: 'Salmão com legumes',
      calories: 400,
      type: 'dinner',
      time: '19:00',
    },
  ])

  // Dados semanais para gráfico
  const weeklyCalories = [
    { day: 'Seg', calories: 1650 },
    { day: 'Ter', calories: 1720 },
    { day: 'Qua', calories: 1580 },
    { day: 'Qui', calories: 1800 },
    { day: 'Sex', calories: 1690 },
    { day: 'Sáb', calories: 1950 },
    { day: 'Dom', calories: 1450 },
  ]

  const maxWeeklyCalories = Math.max(...weeklyCalories.map(d => d.calories))

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: '',
    type: 'breakfast' as Meal['type'],
    time: '',
  })

  const dailyGoal = 1800
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0)
  const remainingCalories = dailyGoal - totalCalories
  const progressPercentage = Math.min((totalCalories / dailyGoal) * 100, 100)

  const handleAddMeal = () => {
    if (!newMeal.name || !newMeal.calories || !newMeal.time) return

    const meal: Meal = {
      id: Date.now().toString(),
      name: newMeal.name,
      calories: parseInt(newMeal.calories),
      type: newMeal.type,
      time: newMeal.time,
    }

    setMeals([...meals, meal])
    setNewMeal({ name: '', calories: '', type: 'breakfast', time: '' })
    setIsDialogOpen(false)
  }

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter((meal) => meal.id !== id))
  }

  const getMealsByType = (type: Meal['type']) => {
    return meals.filter((meal) => meal.type === type)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          Controle de Calorias
        </h1>
        <p className="text-slate-600 text-lg">
          Acompanhe sua ingestão diária e atinja suas metas
        </p>
      </div>

      {/* Daily Summary */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-sm font-semibold text-slate-600 mb-2">Hoje</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold text-slate-900">
                {totalCalories}
              </span>
              <span className="text-xl text-slate-600">/ {dailyGoal} kcal</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {remainingCalories > 0 ? (
                <span className="text-emerald-600 font-semibold">
                  Restam {remainingCalories} kcal
                </span>
              ) : (
                <span className="text-orange-600 font-semibold">
                  Meta atingida! (+{Math.abs(remainingCalories)} kcal)
                </span>
              )}
            </p>
          </div>

          <div className="w-full md:w-64">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-slate-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                  className="text-emerald-500 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Chart */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Calorias Semanais</h3>
            <p className="text-sm text-slate-600">Últimos 7 dias</p>
          </div>
        </div>
        <div className="space-y-3">
          {weeklyCalories.map((data) => {
            const percentage = (data.calories / maxWeeklyCalories) * 100
            const isOverGoal = data.calories > dailyGoal
            return (
              <div key={data.day} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-10">{data.day}</span>
                <div className="flex-1 bg-slate-200 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 ${
                      isOverGoal
                        ? 'bg-gradient-to-r from-orange-500 to-red-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
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

      {/* Add Meal Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Refeições de Hoje</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Refeição
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Refeição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="meal-name">Nome da Refeição</Label>
                <Input
                  id="meal-name"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  placeholder="Ex: Frango grelhado"
                />
              </div>
              <div>
                <Label htmlFor="meal-calories">Calorias (kcal)</Label>
                <Input
                  id="meal-calories"
                  type="number"
                  value={newMeal.calories}
                  onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                  placeholder="Ex: 350"
                />
              </div>
              <div>
                <Label htmlFor="meal-type">Tipo de Refeição</Label>
                <Select
                  value={newMeal.type}
                  onValueChange={(value: Meal['type']) =>
                    setNewMeal({ ...newMeal, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Café da Manhã</SelectItem>
                    <SelectItem value="lunch">Almoço</SelectItem>
                    <SelectItem value="dinner">Jantar</SelectItem>
                    <SelectItem value="snack">Lanche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="meal-time">Horário</Label>
                <Input
                  id="meal-time"
                  type="time"
                  value={newMeal.time}
                  onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                />
              </div>
              <Button
                onClick={handleAddMeal}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-semibold"
              >
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meals by Type */}
      <div className="space-y-6">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as Meal['type'][]).map((type) => {
          const typeMeals = getMealsByType(type)
          if (typeMeals.length === 0) return null

          const Icon = mealIcons[type]
          const totalTypeCalories = typeMeals.reduce((sum, meal) => sum + meal.calories, 0)

          return (
            <Card key={type} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`bg-gradient-to-br ${mealColors[type]} p-2 rounded-lg shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{mealLabels[type]}</h3>
                  <p className="text-sm text-slate-600 font-semibold">{totalTypeCalories} kcal</p>
                </div>
              </div>

              <div className="space-y-3">
                {typeMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{meal.name}</h4>
                      <p className="text-sm text-slate-600">{meal.time}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-emerald-600">{meal.calories} kcal</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
