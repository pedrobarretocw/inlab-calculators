import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const domain = email.split('@')[1]

    // Validação: apenas domínios cloudwalk.io são permitidos
    if (domain !== 'cloudwalk.io') {
      return NextResponse.json(
        { error: 'Access denied. Only CloudWalk employees are authorized to access the admin panel.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Domain validation error:', error)
    return NextResponse.json(
      { error: 'Unable to validate domain. Please try again.' },
      { status: 500 }
    )
  }
}
