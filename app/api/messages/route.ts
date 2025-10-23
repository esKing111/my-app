import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/messages - list all messages
export async function GET() {
  try {
    const items = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(items)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch messages'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/messages - create a new message
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<{
      category: string
      text: string
      status: string
      escalatable: boolean
      lawBroken: string | null
      reason: string | null
    }>
    const { category, text, status = 'normal', escalatable = false, lawBroken = null, reason = null } = body || {}

    if (!category || !text) {
      return NextResponse.json({ error: 'category and text are required' }, { status: 400 })
    }

    const created = await prisma.message.create({
      data: {
        category: String(category),
        text: String(text),
        status: String(status),
        escalatable: Boolean(escalatable),
        lawBroken: lawBroken ? String(lawBroken) : null,
        reason: reason ? String(reason) : null,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create message'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
