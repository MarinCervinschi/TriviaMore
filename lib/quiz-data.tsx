'use client'

import QuizClass from "@/types/QuizClass"
import webTecnologies from "./web-tecnologies"
import softwareEngineering from "./software-engineering";
import { TbWorldCode } from "react-icons/tb";
import { PiTreeStructureBold } from "react-icons/pi";

const quizData: QuizClass[] = [
    {
        id: "web-tecnologies",
        name: "Tecnologie Web",
        sections: webTecnologies,
        icon: <TbWorldCode />
    },
    {
        id: "software-engineering",
        name: "Ingegneria del Software",
        sections: softwareEngineering,
        icon: <PiTreeStructureBold />
    },
]

export default quizData
