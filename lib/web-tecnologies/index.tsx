'use client'

import www from "./sections/www";
import tcpIp from "./sections/tcp-ip";
import http from "./sections/http";
import uri from "./sections/uri";
import html from "./sections/html";
import css from "./sections/css";
import webDinamico from "./sections/web-dinamico";
import javascript from "./sections/javascript";
import ajax from "./sections/ajax";
import json from "./sections/json";
import webApplication from "./sections/web-application";
import react from "./sections/react";
import api from "./sections/api";
import semanticWeb from "./sections/semantic-web";

import QuizSection from "@/types/QuizSection";
import { shuffleArray } from "../utils";

import { TbWorldWww, TbApiApp } from "react-icons/tb";
import { MdWeb, MdHttps, MdLink, MdOutlineDynamicForm, MdOutlineWeb } from "react-icons/md";
import { FaHtml5, FaCss3, FaJsSquare, FaReact, FaSyncAlt } from "react-icons/fa";
import { LuFileJson2 } from "react-icons/lu";
import { SiSemanticuireact } from "react-icons/si";

const webTecnologies: QuizSection[] = [
    {
        id: "www",
        name: "WWW",
        questions: shuffleArray(www),
        icon: <TbWorldWww />
    },
    {
        id: "tcp-ip",
        name: "TCP/IP",
        questions: shuffleArray(tcpIp),
        icon: <MdWeb />
    },
    {
        id: "http",
        name: "HTTP",
        questions: shuffleArray(http),
        icon: <MdHttps />
    },
    {
        id: "uri",
        name: "URI",
        questions: shuffleArray(uri),
        icon: <MdLink />
    },
    {
        id: "html",
        name: "HTML",
        questions: shuffleArray(html),
        icon: <FaHtml5 />
    },
    {
        id: "css",
        name: "CSS",
        questions: css,
        icon: <FaCss3 />
    },
    {
        id: "web-dinamico",
        name: "Web Dinamico",
        questions: shuffleArray(webDinamico),
        icon: <MdOutlineDynamicForm />
    },
    {
        id: "javascript",
        name: "Javascript",
        questions: shuffleArray(javascript),
        icon: <FaJsSquare />
    },
    {
        id: "ajax",
        name: "AJAX",
        questions: shuffleArray(ajax),
        icon: <FaSyncAlt />
    },
    {
        id: "json",
        name: "JSON",
        questions: shuffleArray(json),
        icon: <LuFileJson2 />
    },
    {
        id: "web-application",
        name: "Web Application",
        questions: shuffleArray(webApplication),
        icon: <MdOutlineWeb />
    },
    {
        id: "react",
        name: "React",
        questions: shuffleArray(react),
        icon: <FaReact />
    },
    {
        id: "api",
        name: "API",
        questions: shuffleArray(api),
        icon: <TbApiApp />
    },
    {
        id: "semantic-web",
        name: "Semantic Web",
        questions: shuffleArray(semanticWeb),
        icon: <SiSemanticuireact />
    }

];

export default webTecnologies;