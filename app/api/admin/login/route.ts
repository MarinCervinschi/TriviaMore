import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(req: Request) {
    const { username, password } = await req.json()

    try {
        /* const p = await bcrypt.hash(password, 10)
        console.log(p) */
        // Trova l'utente nel database
        const user = await prisma.adminUser.findUnique({
            where: { username }
        })

        if (!user) {
            return NextResponse.json({ success: false, message: "Utente non trovato" }, { status: 401 })
        }

        // Confronta la password
        const match = await bcrypt.compare(password, user.password)


        if (!match) {
            return NextResponse.json({ success: false, message: "Password errata" }, { status: 401 })
        }

        // Genera il token JWT
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "10d" })

        return NextResponse.json({ success: true, token })
    } catch (error) {
        console.error("Error during login:", error)
        return NextResponse.json({ success: false, error: "Errore interno" }, { status: 500 })
    }
}