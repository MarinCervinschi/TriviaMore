import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema, z } from "@/lib/validations"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, password } = registerSchema.parse(body)

        const existingUser = await prisma.user.findFirst({
            where: {
                email,
            },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Un utente con questa email esiste già" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "STUDENT",
            },
        })

        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json(
            { user: userWithoutPassword, message: "Utente creato con successo" },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Mappiamo gli errori di validazione Zod in modo più user-friendly
            const fieldErrors = error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }));
            
            return NextResponse.json(
                { 
                    error: "Dati non validi", 
                    details: fieldErrors,
                    message: fieldErrors.map(e => e.message).join(', ')
                },
                { status: 400 }
            )
        }

        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Errore interno del server" },
            { status: 500 }
        )
    }
}
