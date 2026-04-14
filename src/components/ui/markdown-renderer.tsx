import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MarkdownRendererProps {
	content: string;
	className?: string;
	inline?: boolean;
}

export function MarkdownRenderer({ content, className = "", inline = false }: MarkdownRendererProps) {
	if (inline) {
		return (
			<span className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
				<ReactMarkdown
					remarkPlugins={[remarkGfm, remarkMath]}
					rehypePlugins={[rehypeKatex]}
					components={{ p: ({ children }) => <span>{children}</span> }}
				>
					{content}
				</ReactMarkdown>
			</span>
		);
	}

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
