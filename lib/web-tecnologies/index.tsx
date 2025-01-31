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
        get questions() {
            return shuffleArray(www);
        },
        icon: <TbWorldWww />
    },
    {
        id: "tcp-ip",
        name: "TCP/IP",
        get questions() {
            return shuffleArray(tcpIp);
        },
        icon: <MdWeb />
    },
    {
        id: "http",
        name: "HTTP",
        get questions() {
            return shuffleArray(http);
        },
        icon: <MdHttps />
    },
    {
        id: "uri",
        name: "URI",
        get questions() {
            return shuffleArray(uri);
        },
        icon: <MdLink />
    },
    {
        id: "html",
        name: "HTML",
        get questions() {
            return shuffleArray(html);
        },
        icon: <FaHtml5 />
    },
    {
        id: "css",
        name: "CSS",
        get questions() {
            return shuffleArray(css);
        },
        icon: <FaCss3 />
    },
    {
        id: "web-dinamico",
        name: "Web Dinamico",
        get questions() {
            return shuffleArray(webDinamico);
        },
        icon: <MdOutlineDynamicForm />
    },
    {
        id: "javascript",
        name: "Javascript",
        get questions() {
            return shuffleArray(javascript);
        },
        icon: <FaJsSquare />
    },
    {
        id: "ajax",
        name: "AJAX",
        get questions() {
            return shuffleArray(ajax);
        },
        icon: <FaSyncAlt />
    },
    {
        id: "json",
        name: "JSON",
        get questions() {
            return shuffleArray(json);
        },
        icon: <LuFileJson2 />
    },
    {
        id: "web-application",
        name: "Web Application",
        get questions() {
            return shuffleArray(webApplication);
        },
        icon: <MdOutlineWeb />
    },
    {
        id: "react",
        name: "React",
        get questions() {
            return shuffleArray(react);
        },
        icon: <FaReact />
    },
    {
        id: "api",
        name: "API",
        get questions() {
            return shuffleArray(api);
        },
        icon: <TbApiApp />
    },
    {
        id: "semantic-web",
        name: "Semantic Web",
        get questions() {
            return shuffleArray(semanticWeb);
        },
        icon: <SiSemanticuireact />
    }

];

export default webTecnologies;