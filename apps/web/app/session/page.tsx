'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { completeSession } from './actions'

interface Question {
  id: string
  text: string
  category: string
  difficulty: number
}

interface Evaluation {
  score: number
  strengths: string[]
  improvements: string[]
  ideal_answer_hint: string
  answer_style: 'code' | 'explanation' | 'star'
}

function answerInstructions(category: string) {
  if (category === 'System Design') {
    return {
      title: 'How to answer this question',
      lines: [
        'Explain the architecture first.',
        'Cover data flow, scale, storage, and trade-offs.',
        'A diagram-style explanation is fine.',
      ],
    }
  }

  if (category === 'Behavioral') {
    return {
      title: 'How to answer this question',
      lines: [
        'Use STAR format: Situation, Task, Action, Result.',
        'Keep it structured and concrete.',
        'Mention what you learned.',
      ],
    }
  }

  return {
    title: 'How to answer this question',
    lines: [
      'Explain your approach first.',
      'Add code only if it helps your explanation.',
      'Focus on correctness, complexity, and edge cases.',
    ],
  }
}

export default function SessionPage() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('sessionId')
    if (id) setSessionId(id)
  }, [searchParams])

  useEffect(() => {
    if (!sessionId) return

    async function fetchQuestion() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('declared_weaknesses')
        .eq('user_id', user.id)
        .single()

      if (error) {
        setError(error.message)
        return
      }

      const weakness = profile?.declared_weaknesses?.[0] || 'DSA'
      const category =
        weakness === 'Behavioral'
          ? 'Behavioral'
          : weakness === 'System Design'
            ? 'System Design'
            : 'DSA'

      const { data, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category)
        .order('difficulty', { ascending: true })
        .limit(1)
        .single()

      if (qError) {
        setError(qError.message)
        return
      }

      setQuestion(data)
    }

    fetchQuestion()
  }, [sessionId])

  async function handleEvaluate() {
    if (!question || !sessionId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.text,
          answer,
          category: question.category,
        }),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        setError(result.error || 'Evaluation failed')
        setLoading(false)
        return
      }

      setEvaluation(result.evaluation)

      const supabase = createClient()
      await supabase
        .from('sessions')
        .update({ turn_count: 1 })
        .eq('id', sessionId)

      setLoading(false)
    } catch {
      setError('Evaluation failed. Make sure Ollama is running.')
      setLoading(false)
    }
  }

  async function handleFinish() {
    if (!sessionId || !evaluation) return

    const summary = `Question: ${question?.text}\nAnswer: ${answer}\nEvaluation: Strengths - ${evaluation.strengths.join(', ')}, Improvements - ${evaluation.improvements.join(', ')}`

    await completeSession(sessionId, evaluation.score, summary)
  }

  const instructions = question ? answerInstructions(question.category) : null

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7f6f2',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.4rem' }}>
          Practice Session
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.75rem' }}>
          Answer the question as if you're in a real interview.
        </p>

        {instructions && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#1d4ed8',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {instructions.title}
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#1e3a8a' }}>
              {instructions.lines.map(line => (
                <li key={line} style={{ marginBottom: '0.35rem' }}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {question && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#01696f',
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}>
              {question.category} • Difficulty {question.difficulty}
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: '500', lineHeight: 1.5, color: '#1a1a1a' }}>
              {question.text}
            </p>
          </div>
        )}

        {!evaluation ? (
          <div>
            <textarea
              style={{
                width: '100%',
                height: '160px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                marginBottom: '1rem',
                color: '#1a1a1a',
              }}
              placeholder="Type your answer here..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                {error}
              </p>
            )}
            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#9ca3af' : '#01696f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              disabled={loading || !answer}
              onClick={handleEvaluate}
            >
              {loading ? 'Evaluating...' : 'Evaluate Answer'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#c2410c',
                marginBottom: '0.75rem',
              }}>
                Score: {evaluation.score}/10
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#01696f' }}>Strengths:</strong>
                <ul style={{ marginLeft: '1.25rem', color: '#1a1a1a' }}>
                  {evaluation.strengths.map(s => <li key={s}>{s}</li>)}
                </ul>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#c2410c' }}>Improvements:</strong>
                <ul style={{ marginLeft: '1.25rem', color: '#1a1a1a' }}>
                  {evaluation.improvements.map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>

              <div>
                <strong style={{ color: '#6b7280' }}>Hint for ideal answer:</strong>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                  {evaluation.ideal_answer_hint}
                </p>
              </div>
            </div>

            <button
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#01696f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              onClick={handleFinish}
            >
              Finish Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}