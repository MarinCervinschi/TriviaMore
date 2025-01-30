'use client'

import QuizClass from "@/types/QuizClass"
import webTecnologies from "./web-tecnologies"
import { TbWorldCode } from "react-icons/tb";
import calcolatori from "./calcolatori"
import { Computer } from "lucide-react";

const quizData: QuizClass[] = [
    {
        id: "web-tecnologies",
        name: "Tecnologie Web",
        sections: webTecnologies,
        icon: <TbWorldCode />
    },
    {
        id: "calcolatori",
        name: "Calcolatori Elettronici",
        sections: calcolatori,
        icon: <Computer />
    }
]

export default quizData
