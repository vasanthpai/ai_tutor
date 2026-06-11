import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { question, answer, category } = await req.json()

  if (!question || !answer) {
    return NextResponse.json({ error: 'Missing question or answer' }, { status: 400 })
  }

  const schema = {
    type: 'object',
    properties: {
      score: { type: 'number' },
      strengths: { type: 'array', items: { type: 'string' } },
      improvements: { type: 'array', items: { type: 'string' } },
      ideal_answer_hint: { type: 'string' },
      answer_style: { type: 'string', enum: ['code', 'explanation', 'star'] },
    },
    required: ['score', 'strengths', 'improvements', 'ideal_answer_hint', 'answer_style'],
    additionalProperties: false,
  }

  const style =
    category === 'DSA'
      ? 'answer in explanation first; code is optional'
      : category === 'System Design'
        ? 'answer in architecture, flow, scale, and trade-offs'
        : 'answer in STAR format'

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tinyllama',
        stream: false,
        format: schema,
        options: {
          temperature: 0,
        },
        messages: [
          {
            role: 'system',
            content: `You are an interview evaluator. Return only valid JSON matching this schema: ${JSON.stringify(schema)}. Be strict but fair. Keep strengths and improvements short. Do not add any extra text outside JSON.`,
          },
          {
            role: 'user',
            content: `Question category: ${category || 'DSA'}\nHow the user should answer: ${style}\n\nQuestion: ${question}\n\nCandidate answer: ${answer}`,
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || 'Ollama request failed' },
        { status: 500 }
      )
    }

    const content = data?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'Empty response from Ollama' }, { status: 500 })
    }

    let evaluation
    try {
      evaluation = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON returned by Ollama' }, { status: 500 })
    }

    return NextResponse.json({ evaluation })
  } catch (error) {
    return NextResponse.json(
      { error: 'Evaluation failed. Make sure Ollama is running and tinyllama is available.' },
      { status: 500 }
    )
  }
}