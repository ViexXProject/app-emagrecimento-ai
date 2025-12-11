import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json()

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Mensagem e userId são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar dados do usuário para contexto personalizado
    const userData = await getUserContext(userId)

    // Criar contexto personalizado baseado nos dados do usuário
    const systemPrompt = `Você é um assistente nutricional e personal trainer virtual especializado em saúde e fitness. 

DADOS DO USUÁRIO:
${userData}

SUAS RESPONSABILIDADES:
- Fornecer orientações nutricionais personalizadas baseadas no perfil do usuário
- Sugerir refeições saudáveis e balanceadas
- Recomendar treinos adequados ao nível do usuário
- Analisar o progresso e oferecer feedback motivacional
- Responder dúvidas sobre alimentação, exercícios e saúde
- Ser empático, motivador e profissional

DIRETRIZES:
- Use os dados do usuário para personalizar suas respostas
- Seja específico e prático nas recomendações
- Considere as restrições alimentares e condições de saúde
- Incentive hábitos saudáveis de forma positiva
- Se não tiver dados suficientes, peça mais informações ao usuário`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0]?.message?.content || 
      'Desculpe, não consegui processar sua mensagem. Tente novamente.'

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Erro na API de chat:', error)
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    )
  }
}

async function getUserContext(userId: string): Promise<string> {
  try {
    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Buscar treinos recentes (últimas 2 semanas)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    
    const { data: recentWorkouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', twoWeeksAgo.toISOString())
      .order('completed_at', { ascending: false })

    // Buscar consumo de calorias recente (última semana)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { data: recentCalories } = await supabase
      .from('daily_calories')
      .select('*')
      .eq('user_id', userId)
      .gte('date', oneWeekAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    // Buscar estatísticas de peso recentes (último mês)
    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
    
    const { data: recentWeights } = await supabase
      .from('weight_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date', oneMonthAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    // Construir contexto formatado
    let context = ''

    if (profile) {
      context += `PERFIL:
- Idade: ${profile.age || 'não informada'} anos
- Gênero: ${profile.gender || 'não informado'}
- Altura: ${profile.height || 'não informada'} cm
- Peso Atual: ${profile.current_weight || 'não informado'} kg
- Peso Desejado: ${profile.target_weight || 'não informado'} kg
- Nível de Atividade: ${profile.activity_level || 'não informado'}
- Objetivo: ${profile.fitness_goal || 'não informado'}
- Nível de Treino: ${profile.workout_level || 'não informado'}
- Refeições por dia: ${profile.meals_per_day || 'não informado'}
- Copos de água por dia: ${profile.water_intake || 'não informado'}
- Horas de sono: ${profile.sleep_hours || 'não informado'}
- Restrições alimentares: ${profile.dietary_restrictions?.join(', ') || 'nenhuma'}
- Condições de saúde: ${profile.health_conditions?.join(', ') || 'nenhuma'}

`
    } else {
      context += 'PERFIL: Usuário ainda não completou o questionário inicial.\n\n'
    }

    if (recentWorkouts && recentWorkouts.length > 0) {
      context += `TREINOS RECENTES (últimas 2 semanas):
${recentWorkouts.map((w, i) => 
  `${i + 1}. ${w.title} (${w.level}) - ${w.duration} min - ${w.calories_burned} kcal - ${new Date(w.completed_at).toLocaleDateString('pt-BR')}`
).join('\n')}

`
      
      const totalWorkouts = recentWorkouts.length
      const totalCaloriesBurned = recentWorkouts.reduce((sum, w) => sum + w.calories_burned, 0)
      context += `Total: ${totalWorkouts} treinos, ${totalCaloriesBurned} kcal queimadas\n\n`
    } else {
      context += 'TREINOS RECENTES: Nenhum treino registrado nas últimas 2 semanas.\n\n'
    }

    if (recentCalories && recentCalories.length > 0) {
      context += `CONSUMO DE CALORIAS (última semana):
${recentCalories.map((c, i) => 
  `${i + 1}. ${new Date(c.date).toLocaleDateString('pt-BR')}: ${c.calories_consumed}/${c.calories_goal} kcal`
).join('\n')}

`
      const avgCalories = Math.round(
        recentCalories.reduce((sum, c) => sum + c.calories_consumed, 0) / recentCalories.length
      )
      context += `Média diária: ${avgCalories} kcal\n\n`
    } else {
      context += 'CONSUMO DE CALORIAS: Nenhum registro na última semana.\n\n'
    }

    if (recentWeights && recentWeights.length > 0) {
      const latestWeight = recentWeights[0]
      const oldestWeight = recentWeights[recentWeights.length - 1]
      const weightChange = latestWeight.weight - oldestWeight.weight
      
      context += `ESTATÍSTICAS DE PESO (último mês):
- Peso mais recente: ${latestWeight.weight} kg (${new Date(latestWeight.date).toLocaleDateString('pt-BR')})
- Variação no período: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg
- Registros: ${recentWeights.length} medições

`
    } else {
      context += 'ESTATÍSTICAS DE PESO: Nenhum registro no último mês.\n\n'
    }

    return context || 'Nenhum dado disponível ainda. Usuário está começando sua jornada.'
  } catch (error) {
    console.error('Erro ao buscar contexto do usuário:', error)
    return 'Erro ao carregar dados do usuário.'
  }
}
