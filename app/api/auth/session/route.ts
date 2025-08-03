import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: session.user,
      message: "Autenticato con successo",
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}
