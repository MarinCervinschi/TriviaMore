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

export const quizData: QuizSection[] = [
    {
        id: "www",
        name: "WWW",
        questions: www,
        icon: TbWorldWww
    },
    {
        id: "tcp-ip",
        name: "TCP/IP",
        questions: tcpIp,
        icon: MdWeb
    },
    {
        id: "http",
        name: "HTTP",
        questions: http,
        icon: MdHttps
    },
    {
        id: "uri",
        name: "URI",
        questions: uri,
        icon: MdLink
    },
    {
        id: "html",
        name: "HTML",
        questions: html,
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
        questions: webDinamico,
        icon: MdOutlineDynamicForm
    },
    {
        id: "javascript",
        name: "Javascript",
        questions: javascript,
        icon: FaJsSquare
    },
    {
        id: "ajax",
        name: "AJAX",
        questions: ajax,
        icon: FaSyncAlt
    },
    {
        id: "json",
        name: "JSON",
        questions: json,
        icon: LuFileJson2
    },
    {
        id: "web-application",
        name: "Web Application",
        questions: webApplication,
        icon: MdOutlineWeb
    },
    {
        id: "react",
        name: "React",
        questions: react,
        icon: FaReact
    },
    {
        id: "api",
        name: "API",
        questions: api,
        icon: TbApiApp
    },
    {
        id: "semantic-web",
        name: "Semantic Web",
        questions: semanticWeb,
        icon: SiSemanticuireact
    }

];

export function getRandomQuestions(count: number = 20): QuizSection {
    const allQuestions = quizData.flatMap(section => section.questions);
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return {
        id: "random",
        name: "Random Mix",
        questions: selected
    };
}

