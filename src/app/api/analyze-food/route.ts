import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, userId } = await req.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Chave da API OpenAI não configurada. Configure a variável OPENAI_API_KEY nas configurações do projeto.' },
        { status: 500 }
      )
    }

    // Prompt especializado com conhecimento de nutricionista - MENOS RIGOROSO
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um nutricionista formado em Harvard com especialização em análise nutricional de alimentos. 
          
Sua expertise inclui:
- Identificação de alimentos mesmo em fotos de qualidade variável (desfocadas, com pouca luz, ângulos difíceis)
- Estimativa de porções baseada em contexto visual disponível
- Cálculo de macronutrientes (proteínas, carboidratos, gorduras) e calorias
- Conhecimento de diferentes preparações culinárias
- Análise nutricional adaptável à qualidade da imagem

IMPORTANTE - FLEXIBILIDADE NA ANÁLISE:
- Se a foto estiver desfocada ou com baixa qualidade, faça o melhor possível para identificar os alimentos
- Use contexto visual (cores, formas, texturas aparentes) para fazer estimativas razoáveis
- Se não conseguir identificar algo com certeza, faça uma estimativa baseada no que é mais provável
- Priorize fornecer uma análise útil mesmo que não seja 100% precisa
- Seja tolerante com fotos amadoras, mal iluminadas ou parcialmente visíveis

Ao analisar uma foto de prato, você deve:
1. Identificar os alimentos visíveis (mesmo que parcialmente)
2. Estimar porções de forma razoável baseado no contexto
3. Calcular calorias e macronutrientes aproximados
4. Fornecer insights nutricionais relevantes
5. Sugerir melhorias se apropriado

Responda SEMPRE em formato JSON com esta estrutura exata:
{
  "foods": [
    {
      "name": "nome do alimento",
      "portion": "tamanho da porção estimado",
      "calories": número de calorias,
      "protein": gramas de proteína,
      "carbs": gramas de carboidratos,
      "fat": gramas de gordura
    }
  ],
  "totalCalories": número total de calorias,
  "totalProtein": total de proteínas em gramas,
  "totalCarbs": total de carboidratos em gramas,
  "totalFat": total de gorduras em gramas,
  "analysis": "análise nutricional do prato (mencione se a foto estava com qualidade limitada)",
  "recommendations": "recomendações para melhorar a refeição (opcional)"
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta foto de prato de comida e forneça uma análise nutricional. Faça o melhor possível mesmo se a foto não estiver perfeitamente nítida - use o contexto visual disponível para fazer estimativas razoáveis.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'auto' // Mudado de 'high' para 'auto' - mais flexível com qualidade de imagem
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.5, // Aumentado de 0.3 para 0.5 - mais flexível nas respostas
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'Não foi possível analisar a imagem' },
        { status: 500 }
      )
    }

    // Parse do JSON retornado
    let analysisData
    try {
      // Remove markdown code blocks se existirem
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
      analysisData = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA', rawContent: content },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: analysisData
    })

  } catch (error: any) {
    console.error('Erro ao analisar alimento:', error)
    
    // Tratamento específico para erro de autenticação da OpenAI
    if (error.status === 401 || error.message?.includes('authentication') || error.message?.includes('issuer')) {
      return NextResponse.json(
        { error: 'Erro de autenticação com a API OpenAI. Verifique se a chave OPENAI_API_KEY está configurada corretamente nas variáveis de ambiente do projeto.' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro ao processar imagem' },
      { status: 500 }
    )
  }
}
