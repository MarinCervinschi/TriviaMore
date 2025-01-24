'use client'

import QuizClass from "@/types/QuizClass"
import webTecnologies from "./web-tecnologies"
import { TbWorldCode } from "react-icons/tb";

const quizData: QuizClass[] = [
    {
        id: "web-tecnologies",
        name: "Tecnologie Web",
        sections: webTecnologies,
        icon: <TbWorldCode />
    }
]

export default quizData
