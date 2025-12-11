'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { User as UserIcon, Mail, Calendar, Target, TrendingDown, Edit2, Save } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfilePageProps {
  user: User
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: user.user_metadata?.full_name || 'Usuário',
    email: user.email || '',
    age: '28',
    height: '175',
    currentWeight: '82',
    goalWeight: '75',
    dailyCalorieGoal: '1800',
  })

  const handleSave = () => {
    // Aqui você salvaria no Supabase
    setIsEditing(false)
  }

  const stats = [
    {
      label: 'Peso Atual',
      value: `${profile.currentWeight} kg`,
      icon: TrendingDown,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Meta de Peso',
      value: `${profile.goalWeight} kg`,
      icon: Target,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Calorias Diárias',
      value: `${profile.dailyCalorieGoal} kcal`,
      icon: Target,
      color: 'from-orange-500 to-red-600',
    },
  ]

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600 text-lg">Gerencie suas informações e metas</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
            <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" />
              {profile.email}
            </p>
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center md:justify-start gap-2">
              <Calendar className="w-4 h-4" />
              Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200"
              >
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg w-fit mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="mt-1 bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              value={profile.height}
              onChange={(e) => setProfile({ ...profile, height: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="currentWeight">Peso Atual (kg)</Label>
            <Input
              id="currentWeight"
              type="number"
              value={profile.currentWeight}
              onChange={(e) => setProfile({ ...profile, currentWeight: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="goalWeight">Meta de Peso (kg)</Label>
            <Input
              id="goalWeight"
              type="number"
              value={profile.goalWeight}
              onChange={(e) => setProfile({ ...profile, goalWeight: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="dailyCalorieGoal">Meta Diária de Calorias (kcal)</Label>
            <Input
              id="dailyCalorieGoal"
              type="number"
              value={profile.dailyCalorieGoal}
              onChange={(e) => setProfile({ ...profile, dailyCalorieGoal: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Progress Card */}
      <Card className="p-6 md:p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Progresso Geral</h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Peso Perdido</span>
              <span className="text-sm font-bold text-emerald-600">
                {parseFloat(profile.currentWeight) - parseFloat(profile.goalWeight)} kg restantes
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((82 - parseFloat(profile.currentWeight)) /
                      (82 - parseFloat(profile.goalWeight))) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">18</p>
              <p className="text-sm text-gray-600">Dias ativos</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600">Treinos</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">3.5kg</p>
              <p className="text-sm text-gray-600">Perdidos</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">95%</p>
              <p className="text-sm text-gray-600">Meta diária</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
