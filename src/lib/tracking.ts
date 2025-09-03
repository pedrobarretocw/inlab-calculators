import { TrackEventInput } from './schemas'

// Função para enviar eventos de tracking
export async function track(eventData: Omit<TrackEventInput, 'sessionId'>) {
  try {
    // Pegar session_id dos cookies ou criar novo
    const sessionId = getSessionId()
    
    const response = await fetch('/calculadoras/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...eventData,
        sessionId,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      }),
    })

    if (!response.ok) {
      console.warn('Failed to track event:', response.statusText)
    }
  } catch (error) {
    console.warn('Error tracking event:', error)
    // Fail silently - não queremos quebrar a UX por falha no tracking
  }
}

// Gerenciamento de session_id via cookies
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const cookies = document.cookie.split(';')
  const sessionCookie = cookies.find(c => c.trim().startsWith('calc_sid='))
  
  if (sessionCookie) {
    return sessionCookie.split('=')[1]
  }
  
  // Criar novo session_id
  const newSessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  setSessionId(newSessionId)
  return newSessionId
}

export function setSessionId(sessionId: string) {
  if (typeof window === 'undefined') return
  
  const expires = new Date()
  expires.setDate(expires.getDate() + 30) // 30 dias
  
  document.cookie = `calc_sid=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

// Gerenciamento de variante A/B
export function getVariant(): string {
  if (typeof window === 'undefined') return ''
  
  const cookies = document.cookie.split(';')
  const variantCookie = cookies.find(c => c.trim().startsWith('calc_variant='))
  
  return variantCookie ? variantCookie.split('=')[1] : ''
}

export function setVariant(variant: string) {
  if (typeof window === 'undefined') return
  
  const expires = new Date()
  expires.setDate(expires.getDate() + 7) // 7 dias conforme requisitos
  
  document.cookie = `calc_variant=${variant}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}
