'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Dumbbell, Heart, TrendingDown } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Seção de Boas-vindas */}
        <div className="hidden md:flex flex-col gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              FitLife
            </h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Sua jornada de emagrecimento começa aqui
          </h2>
          
          <p className="text-lg text-gray-600">
            Controle suas calorias, receba orientação personalizada de IA e siga planos de treino adaptados ao seu nível.
          </p>

          <div className="grid gap-4 mt-4">
            <div className="flex items-start gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-xl">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <TrendingDown className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Controle de Calorias</h3>
                <p className="text-sm text-gray-600">Acompanhe sua ingestão diária e atinja suas metas</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-xl">
              <div className="bg-teal-100 p-2 rounded-lg">
                <Dumbbell className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Planos de Treino</h3>
                <p className="text-sm text-gray-600">Do iniciante ao avançado, treinos personalizados</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-xl">
              <div className="bg-cyan-100 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Chat com IA</h3>
                <p className="text-sm text-gray-600">Orientação nutricional como um personal trainer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="md:hidden flex flex-col items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              FitLife
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">
            Bem-vindo de volta
          </h2>
          <p className="text-gray-600 mb-6 text-center md:text-left">
            Entre ou crie sua conta para começar
          </p>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#059669',
                    brandAccent: '#047857',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300',
                input: 'rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500',
              },
            }}
            providers={['google', 'github', 'apple', 'azure', 'facebook', 'twitter']}
            redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                  phone_input_placeholder: 'Seu número de telefone',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Crie uma senha',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Não tem conta? Cadastre-se',
                  phone_input_placeholder: 'Seu número de telefone',
                },
              },
            }}
            view="sign_in"
            showLinks={true}
            magicLink={true}
          />
        </div>
      </div>
    </div>
  )
}
