"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
	return (
		<div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeKatex]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
