'use client'

import QuizClass from "@/types/QuizClass"
import webTecnologies from "./web-tecnologies"
import softwareEngineering from "./software-engineering";
import calcolatori from "./calcolatori";

import { TbWorldCode } from "react-icons/tb";
import { Computer } from "lucide-react";
import { PiTreeStructureBold } from "react-icons/pi";

const quizData: QuizClass[] = [
    {
        id: "web-tecnologies",
        name: "Tecnologie Web",
        get sections() {
            return webTecnologies
        },
        icon: <TbWorldCode />
    },
    {
        id: "software-engineering",
        name: "Ingegneria del Software",
        get sections() {
            return softwareEngineering
        },
        icon: <PiTreeStructureBold />
    },
    {
        id: "calcolatori",
        name: "Calcolatori Elettronici",
        get sections() {
            return calcolatori
        },
        icon: <Computer />
    }
]

export default quizData
