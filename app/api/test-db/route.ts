// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Executes a simple raw query to ping MySQL
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ status: "Connected successfully to MySQL!" })
  } catch (error) {
    return NextResponse.json(
      { status: "Connection failed", error: String(error) },
      { status: 500 }
    )
  }
}
