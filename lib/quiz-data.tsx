'use client'

import QuizClass from "@/types/QuizClass"
import webTecnologies from "./web-tecnologies"
import softwareEngineering from "./software-engineering";
import calcolatori from "./calcolatori";

import { TbWorldCode } from "react-icons/tb";
import { Computer } from "lucide-react";
import { PiTreeStructureBold } from "react-icons/pi";

export const iconMap: { [key: string]: JSX.Element } = {
    TbWorldCode: <TbWorldCode />,
    PiTreeStructureBold: <PiTreeStructureBold />,
    Computer: <Computer />
};

const quizData: QuizClass[] = [
    {
        id: "web-tecnologies",
        name: "Tecnologie Web",
        icon: <TbWorldCode />
    },
    {
        id: "software-engineering",
        name: "Ingegneria del Software",
        icon: <PiTreeStructureBold />
    },
    {
        id: "calcolatori",
        name: "Calcolatori Elettronici",
        icon: <Computer />
    }
]

export default quizData
