import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const isAdmin = req.cookies.admin_token ? true : false;
    const classes = await prisma.class.findMany();
    
    res.status(200).json(isAdmin ? classes : classes.filter(c => c.visibility));
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Error fetching classes" });
  }
}