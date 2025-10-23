import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/messages/[id]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params
  const id = Number(idParam)
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const item = await prisma.message.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(item)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch message'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT /api/messages/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params
  const id = Number(idParam)
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const body = (await req.json()) as Partial<{
      category: string
      text: string
      status: string
      escalatable: boolean
      lawBroken: string | null
      reason: string | null
    }>
    const data: Partial<{
      category: string
      text: string
      status: string
      escalatable: boolean
      lawBroken: string | null
      reason: string | null
    }> = {}
    if (body.category !== undefined) data.category = String(body.category)
    if (body.text !== undefined) data.text = String(body.text)
    if (body.status !== undefined) data.status = String(body.status)
    if (body.escalatable !== undefined) data.escalatable = Boolean(body.escalatable)
    if (body.lawBroken !== undefined) data.lawBroken = body.lawBroken ? String(body.lawBroken) : null
    if (body.reason !== undefined) data.reason = body.reason ? String(body.reason) : null

    const updated = await prisma.message.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update message'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/messages/[id]
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params
  const id = Number(idParam)
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    await prisma.message.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete message'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
