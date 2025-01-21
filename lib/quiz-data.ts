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

export const quizData: QuizSection[] = [
    {
        id: "www",
        name: "WWW",
        questions: www
    },
    {
        id: "tcp-ip",
        name: "TCP/IP",
        questions: tcpIp
    },
    {
        id: "http",
        name: "HTTP",
        questions: http
    },
    {
        id: "uri",
        name: "URI",
        questions: uri
    },
    {
        id: "html",
        name: "HTML",
        questions: html
    },
    {
        id: "css",
        name: "CSS",
        questions: css
    },
    {
        id: "web-dinamico",
        name: "Web Dinamico",
        questions: webDinamico
    },
    {
        id: "javascript",
        name: "Javascript",
        questions: javascript
    },
    {
        id: "ajax",
        name: "AJAX",
        questions: ajax
    },
    {
        id: "json",
        name: "JSON",
        questions: json
    },
    {
        id: "web-application",
        name: "Web Application",
        questions: webApplication
    },
    {
        id: "react",
        name: "React",
        questions: react
    },
    {
        id: "api",
        name: "API",
        questions: api
    },
    {
        id: "semantic-web",
        name: "Semantic Web",
        questions: semanticWeb
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

