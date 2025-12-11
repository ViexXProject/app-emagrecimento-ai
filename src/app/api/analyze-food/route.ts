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
        { error: 'Chave da API OpenAI não configurada' },
        { status: 500 }
      )
    }

    // Prompt especializado com conhecimento de nutricionista de Harvard
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um nutricionista formado em Harvard com especialização em análise nutricional de alimentos. 
          
Sua expertise inclui:
- Identificação precisa de alimentos e porções
- Cálculo detalhado de macronutrientes (proteínas, carboidratos, gorduras)
- Estimativa de calorias baseada em métodos científicos
- Conhecimento de diferentes preparações culinárias e seus impactos nutricionais
- Análise de qualidade nutricional dos alimentos

Ao analisar uma foto de prato, você deve:
1. Identificar todos os alimentos visíveis
2. Estimar o tamanho das porções com precisão
3. Calcular calorias totais e macronutrientes
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
  "analysis": "análise nutricional detalhada do prato",
  "recommendations": "recomendações para melhorar a refeição (opcional)"
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta foto de prato de comida e forneça uma análise nutricional completa e precisa.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.3, // Baixa temperatura para respostas mais precisas
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
    return NextResponse.json(
      { error: error.message || 'Erro ao processar imagem' },
      { status: 500 }
    )
  }
}
