'use client'

import { useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface FoodAnalyzerProps {
  user: User
}

interface FoodItem {
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface AnalysisResult {
  foods: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  analysis: string
  recommendations?: string
}

export default function FoodAnalyzer({ user }: FoodAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem muito grande. Máximo 5MB.')
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione uma imagem válida.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setResult(null)
        setError(null)
        setSaved(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: selectedImage,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao analisar imagem')
      }

      setResult(data.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao analisar imagem')
    } finally {
      setAnalyzing(false)
    }
  }

  const saveToDatabase = async () => {
    if (!result) return

    try {
      const today = new Date().toISOString().split('T')[0]

      // Buscar registro existente do dia
      const { data: existingData } = await supabase
        .from('daily_calories')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      const mealData = {
        time: new Date().toISOString(),
        foods: result.foods,
        totalCalories: result.totalCalories,
        analysis: result.analysis,
        imageUrl: selectedImage,
      }

      if (existingData) {
        // Atualizar registro existente
        const currentMeals = existingData.meals || []
        const updatedMeals = [...currentMeals, mealData]
        const newTotalCalories = existingData.calories_consumed + result.totalCalories

        const { error } = await supabase
          .from('daily_calories')
          .update({
            calories_consumed: newTotalCalories,
            meals: updatedMeals,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id)

        if (error) throw error
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('daily_calories')
          .insert({
            user_id: user.id,
            date: today,
            calories_consumed: result.totalCalories,
            calories_goal: 2000, // Valor padrão, pode ser ajustado
            meals: [mealData],
          })

        if (error) throw error
      }

      setSaved(true)
      setTimeout(() => {
        setSelectedImage(null)
        setResult(null)
        setSaved(false)
      }, 2000)
    } catch (err: any) {
      setError('Erro ao salvar no banco de dados: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Análise Nutricional com IA
          </h1>
          <p className="text-gray-600">
            Tire uma foto, escolha da galeria ou faça upload de uma imagem do seu prato
          </p>
        </div>

        {/* Upload Options */}
        {!selectedImage && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Camera Option */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <Camera className="w-12 h-12 text-emerald-600 mb-3" />
                <p className="text-lg font-medium text-gray-700 mb-1">
                  Tirar Foto
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Use a câmera do dispositivo
                </p>
              </button>

              {/* Gallery/Files Option */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all"
              >
                <ImageIcon className="w-12 h-12 text-teal-600 mb-3" />
                <p className="text-lg font-medium text-gray-700 mb-1">
                  Escolher da Galeria
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Selecione uma foto existente
                </p>
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Formatos aceitos: PNG, JPG, JPEG • Tamanho máximo: 5MB
            </p>

            {/* Hidden Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Image Preview & Analysis */}
        {selectedImage && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="relative w-full h-64 md:h-96 mb-6 rounded-xl overflow-hidden">
              <Image
                src={selectedImage}
                alt="Prato de comida"
                fill
                className="object-cover"
              />
            </div>

            {!result && !analyzing && (
              <div className="flex gap-4">
                <Button
                  onClick={analyzeImage}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 text-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Analisar Prato
                </Button>
                <Button
                  onClick={() => {
                    setSelectedImage(null)
                    setResult(null)
                    setError(null)
                  }}
                  variant="outline"
                  className="px-6"
                >
                  Cancelar
                </Button>
              </div>
            )}

            {analyzing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-3" />
                <p className="text-lg text-gray-700">Analisando com IA...</p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Calorias</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {result.totalCalories}
                </p>
                <p className="text-xs text-gray-500">kcal</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Proteínas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.totalProtein}g
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Carboidratos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {result.totalCarbs}g
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Gorduras</p>
                <p className="text-2xl font-bold text-purple-600">
                  {result.totalFat}g
                </p>
              </div>
            </div>

            {/* Food Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Alimentos Identificados
              </h3>
              <div className="space-y-3">
                {result.foods.map((food, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{food.name}</p>
                      <p className="text-sm text-gray-600">{food.portion}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{food.calories} kcal</p>
                      <p className="text-xs text-gray-500">
                        P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Análise Nutricional
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">{result.analysis}</p>
              
              {result.recommendations && (
                <>
                  <h4 className="font-semibold text-gray-900 mb-2">Recomendações:</h4>
                  <p className="text-gray-700 leading-relaxed">{result.recommendations}</p>
                </>
              )}
            </div>

            {/* Save Button */}
            {!saved && (
              <Button
                onClick={saveToDatabase}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 text-lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Salvar Refeição
              </Button>
            )}

            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-green-800 font-medium">Refeição salva com sucesso!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
