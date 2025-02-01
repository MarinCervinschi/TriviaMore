import QuizSection from "@/types/QuizSection";
import { shuffleArray } from "../utils";
import { Computer } from "lucide-react";
import calcolatoriElettronici from "./sections/calcolatori";

const calcolatori: QuizSection[] = [
    {
        id: "calcolatori",
        name: "Calcolatori Elettronici",
        get questions() {
            return shuffleArray(calcolatoriElettronici);
        },
        icon: <Computer />
    },
];

export default calcolatori;