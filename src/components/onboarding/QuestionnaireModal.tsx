'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ChevronRight, ChevronLeft, CheckCircle, SkipForward } from 'lucide-react'

interface QuestionnaireModalProps {
  user: User
  onComplete: () => void
}

type WorkoutLevel = 'beginner' | 'easy' | 'intermediate' | 'advanced'

export default function QuestionnaireModal({ user, onComplete }: QuestionnaireModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Dados do formulário
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    current_weight: '',
    target_weight: '',
    activity_level: '',
    fitness_goal: '',
    dietary_restrictions: [] as string[],
    health_conditions: [] as string[],
    meals_per_day: '',
    water_intake: '',
    sleep_hours: '',
  })

  const calculateWorkoutLevel = (): WorkoutLevel => {
    const age = parseInt(formData.age)
    const activityLevel = formData.activity_level
    const fitnessGoal = formData.fitness_goal
    const currentWeight = parseFloat(formData.current_weight)
    const targetWeight = parseFloat(formData.target_weight)
    const weightDiff = Math.abs(currentWeight - targetWeight)

    let score = 0

    // Pontuação baseada na idade
    if (age < 30) score += 3
    else if (age < 45) score += 2
    else score += 1

    // Pontuação baseada no nível de atividade
    if (activityLevel === 'very_active') score += 4
    else if (activityLevel === 'active') score += 3
    else if (activityLevel === 'moderate') score += 2
    else if (activityLevel === 'light') score += 1

    // Pontuação baseada no objetivo
    if (fitnessGoal === 'gain_muscle') score += 2
    else if (fitnessGoal === 'improve_health') score += 1

    // Ajuste baseado na diferença de peso
    if (weightDiff > 20) score -= 1

    // Determinar nível
    if (score <= 3) return 'beginner'
    if (score <= 5) return 'easy'
    if (score <= 7) return 'intermediate'
    return 'advanced'
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const workoutLevel = calculateWorkoutLevel()

      const { error } = await supabase.from('user_profiles').upsert({
        user_id: user.id,
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        current_weight: parseFloat(formData.current_weight),
        target_weight: parseFloat(formData.target_weight),
        activity_level: formData.activity_level,
        fitness_goal: formData.fitness_goal,
        dietary_restrictions: formData.dietary_restrictions,
        health_conditions: formData.health_conditions,
        meals_per_day: parseInt(formData.meals_per_day),
        water_intake: parseInt(formData.water_intake),
        sleep_hours: parseFloat(formData.sleep_hours),
        workout_level: workoutLevel,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

      if (error) {
        alert('Erro ao salvar perfil. Tente novamente.')
        throw error
      }

      // Aguardar um momento para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Chamar onComplete para fechar o modal e atualizar o Dashboard
      onComplete()
    } catch (error) {
      alert('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkipTemporarily = async () => {
    setLoading(true)
    try {
      // Salvar perfil mínimo para permitir acesso temporário
      const { error } = await supabase.from('user_profiles').upsert({
        user_id: user.id,
        age: 25, // Valores padrão
        gender: 'Não informado',
        height: 170,
        current_weight: 70,
        target_weight: 70,
        activity_level: 'moderate',
        fitness_goal: 'improve_health',
        dietary_restrictions: [],
        health_conditions: [],
        meals_per_day: 3,
        water_intake: 8,
        sleep_hours: 7,
        workout_level: 'beginner',
        onboarding_completed: false, // Marca como não completado
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

      if (error) {
        alert('Erro ao pular questionário. Tente novamente.')
        throw error
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      onComplete()
    } catch (error) {
      alert('Erro ao pular questionário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item)
    }
    return [...array, item]
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Questionário de Perfil
            </h2>
            <Button
              onClick={handleSkipTemporarily}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Pular
            </Button>
          </div>
          <p className="text-gray-600">
            Responda algumas perguntas para personalizarmos seu plano de treino
          </p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Dados Básicos */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Dados Básicos</h3>

            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Ex: 30"
              />
            </div>

            <div>
              <Label>Gênero</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {['Masculino', 'Feminino'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setFormData({ ...formData, gender })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.gender === gender
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="Ex: 170"
                />
              </div>

              <div>
                <Label htmlFor="current_weight">Peso Atual (kg)</Label>
                <Input
                  id="current_weight"
                  type="number"
                  value={formData.current_weight}
                  onChange={(e) => setFormData({ ...formData, current_weight: e.target.value })}
                  placeholder="Ex: 75"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="target_weight">Peso Desejado (kg)</Label>
              <Input
                id="target_weight"
                type="number"
                value={formData.target_weight}
                onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
                placeholder="Ex: 70"
              />
            </div>
          </div>
        )}

        {/* Step 2: Atividade e Objetivo */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Atividade e Objetivo</h3>

            <div>
              <Label>Nível de Atividade Física Atual</Label>
              <div className="space-y-2 mt-2">
                {[
                  { value: 'sedentary', label: 'Sedentário (pouco ou nenhum exercício)' },
                  { value: 'light', label: 'Leve (exercício 1-3 dias/semana)' },
                  { value: 'moderate', label: 'Moderado (exercício 3-5 dias/semana)' },
                  { value: 'active', label: 'Ativo (exercício 6-7 dias/semana)' },
                  { value: 'very_active', label: 'Muito Ativo (exercício intenso diário)' },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setFormData({ ...formData, activity_level: level.value })}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      formData.activity_level === level.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Objetivo Principal</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {[
                  { value: 'lose_weight', label: 'Perder Peso' },
                  { value: 'gain_muscle', label: 'Ganhar Massa Muscular' },
                  { value: 'maintain', label: 'Manter Peso' },
                  { value: 'improve_health', label: 'Melhorar Saúde' },
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setFormData({ ...formData, fitness_goal: goal.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.fitness_goal === goal.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Alimentação */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Hábitos Alimentares</h3>

            <div>
              <Label htmlFor="meals_per_day">Quantas refeições por dia?</Label>
              <Input
                id="meals_per_day"
                type="number"
                value={formData.meals_per_day}
                onChange={(e) => setFormData({ ...formData, meals_per_day: e.target.value })}
                placeholder="Ex: 3"
              />
            </div>

            <div>
              <Label htmlFor="water_intake">Quantos copos de água por dia?</Label>
              <Input
                id="water_intake"
                type="number"
                value={formData.water_intake}
                onChange={(e) => setFormData({ ...formData, water_intake: e.target.value })}
                placeholder="Ex: 8"
              />
            </div>

            <div>
              <Label htmlFor="sleep_hours">Horas de sono por noite</Label>
              <Input
                id="sleep_hours"
                type="number"
                step="0.5"
                value={formData.sleep_hours}
                onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value })}
                placeholder="Ex: 7.5"
              />
            </div>

            <div>
              <Label>Restrições Alimentares (opcional)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Vegetariano', 'Vegano', 'Sem Glúten', 'Sem Lactose', 'Diabético'].map(
                  (restriction) => (
                    <button
                      key={restriction}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          dietary_restrictions: toggleArrayItem(
                            formData.dietary_restrictions,
                            restriction
                          ),
                        })
                      }
                      className={`p-2 rounded-lg border-2 text-sm transition-all ${
                        formData.dietary_restrictions.includes(restriction)
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {restriction}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Condições de Saúde */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Condições de Saúde</h3>

            <div>
              <Label>Possui alguma condição de saúde? (opcional)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  'Hipertensão',
                  'Diabetes',
                  'Problemas Cardíacos',
                  'Problemas Articulares',
                  'Asma',
                  'Nenhuma',
                ].map((condition) => (
                  <button
                    key={condition}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        health_conditions: toggleArrayItem(
                          formData.health_conditions,
                          condition
                        ),
                      })
                    }
                    className={`p-2 rounded-lg border-2 text-sm transition-all ${
                      formData.health_conditions.includes(condition)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-1">Quase lá!</h4>
                  <p className="text-sm text-emerald-700">
                    Com base nas suas respostas, vamos calcular o nível de treino ideal para você
                    e personalizar seu plano de exercícios.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button onClick={prevStep} variant="outline" className="flex-1">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
          )}

          {step < 4 ? (
            <Button
              onClick={nextStep}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              Próximo
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {loading ? 'Salvando...' : 'Finalizar'}
              <CheckCircle className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
