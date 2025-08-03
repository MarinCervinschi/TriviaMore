import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: "Accesso autorizzato!",
      user: session.user,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Protected API error:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}
