import QuizSection from "@/types/QuizSection";
import { shuffleArray } from "../utils";
import { Computer } from "lucide-react";
import calcolatoriElettronici from "./sections/calcolatori";
import prestazioni from "./sections/prestazioni";
import { HiMiniCpuChip } from "react-icons/hi2";
import retiLogiche from "./sections/reti-logiche";
import { TbLogicXor } from "react-icons/tb";

const calcolatori: QuizSection[] = [
    {
        id: "calcolatori",
        name: "Calcolatori Elettronici",
        get questions() {
            return shuffleArray(calcolatoriElettronici);
        },
        icon: <Computer />
    },
    {
        id: "prestazioni",
        name: "Prestazioni",
        get questions() {
            return shuffleArray(prestazioni);
        },
        icon: <HiMiniCpuChip />
    },
    {
        id: "reti",
        name: "Reti Logiche",
        get questions() {
            return shuffleArray(retiLogiche);
        },
        icon: <TbLogicXor />
    },

];

export default calcolatori;