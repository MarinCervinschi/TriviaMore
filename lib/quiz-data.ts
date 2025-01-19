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

