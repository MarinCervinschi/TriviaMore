export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswers: number[];
    section: string;
}

export interface QuizSection {
    id: string;
    name: string;
    questions: QuizQuestion[];
    icon?: React.ComponentType;
}

import www from "./www";
import tcpIp from "./tcp-ip";
import http from "./http";
import uri from "./uri";
import html from "./html";
import css from "./css";
import webDinamico from "./web-dinamico";
import javascript from "./javascript";
import ajax from "./ajax";
import json from "./json";
import webApplication from "./web-application";
import react from "./react";
import api from "./api";
import semanticWeb from "./semantic-web";

import { TbWorldWww, TbApiApp } from "react-icons/tb";
import { MdWeb, MdHttps, MdLink, MdOutlineDynamicForm, MdOutlineWeb } from "react-icons/md";
import { FaHtml5, FaCss3, FaJsSquare, FaReact, FaSyncAlt } from "react-icons/fa";
import { LuFileJson2 } from "react-icons/lu";
import { SiSemanticuireact } from "react-icons/si";

function shuffleArray(array: QuizQuestion[]): QuizQuestion[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const quizData: QuizSection[] = [
    {
        id: "www",
        name: "WWW",
        questions: shuffleArray(www),
        icon: TbWorldWww
    },
    {
        id: "tcp-ip",
        name: "TCP/IP",
        questions: shuffleArray(tcpIp),
        icon: MdWeb
    },
    {
        id: "http",
        name: "HTTP",
        questions: shuffleArray(http),
        icon: MdHttps
    },
    {
        id: "uri",
        name: "URI",
        questions: shuffleArray(uri),
        icon: MdLink
    },
    {
        id: "html",
        name: "HTML",
        questions: shuffleArray(html),
        icon: FaHtml5
    },
    {
        id: "css",
        name: "CSS",
        questions: css,
        icon: FaCss3
    },
    {
        id: "web-dinamico",
        name: "Web Dinamico",
        questions: shuffleArray(webDinamico),
        icon: MdOutlineDynamicForm
    },
    {
        id: "javascript",
        name: "Javascript",
        questions: shuffleArray(javascript),
        icon: FaJsSquare
    },
    {
        id: "ajax",
        name: "AJAX",
        questions: shuffleArray(ajax),
        icon: FaSyncAlt
    },
    {
        id: "json",
        name: "JSON",
        questions: shuffleArray(json),
        icon: LuFileJson2
    },
    {
        id: "web-application",
        name: "Web Application",
        questions: shuffleArray(webApplication),
        icon: MdOutlineWeb
    },
    {
        id: "react",
        name: "React",
        questions: shuffleArray(react),
        icon: FaReact
    },
    {
        id: "api",
        name: "API",
        questions: shuffleArray(api),
        icon: TbApiApp
    },
    {
        id: "semantic-web",
        name: "Semantic Web",
        questions: shuffleArray(semanticWeb),
        icon: SiSemanticuireact
    }

];

export function getRandomQuestions(count: number = 20): QuizSection {
    const allQuestions = quizData.flatMap(section => section.questions);
    const shuffled = shuffleArray(allQuestions);
    const selected = shuffled.slice(0, count);

    return {
        id: "random",
        name: "Random Mix",
        questions: selected
    };
}

