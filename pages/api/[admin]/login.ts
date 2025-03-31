import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { username, password } = req.body;

    try {
        // Trova l'utente nel database
        const user = await prisma.adminUser.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Utente non trovato' });
        }

        // Confronta la password
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: 'Password errata' });
        }

        // Genera il token JWT
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '10d' });

        return res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, error: 'Errore interno' });
    }
}