import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[TEST] Verificando variáveis de ambiente...')
    
    const apiKey = process.env.ACTIVECAMPAIGN_API_KEY
    const baseUrl = process.env.ACTIVECAMPAIGN_BASE_URL
    
    console.log('[TEST] API_KEY exists:', !!apiKey)
    console.log('[TEST] BASE_URL exists:', !!baseUrl)
    console.log('[TEST] BASE_URL value:', baseUrl)
    
    // Listar todas as variáveis que começam com ACTIVE
    const activeVars = Object.keys(process.env).filter(key => key.includes('ACTIVE'))
    console.log('[TEST] Variáveis disponíveis:', activeVars)
    
    return NextResponse.json({
      success: true,
      hasApiKey: !!apiKey,
      hasBaseUrl: !!baseUrl,
      baseUrl: baseUrl ? baseUrl.substring(0, 20) + '...' : 'N/A',
      availableVars: activeVars
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
