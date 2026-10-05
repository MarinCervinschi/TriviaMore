import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface MarkdownRendererProps {
	content: string;
	className?: string;
	inline?: boolean;
	/** Set the prose scale here; a `prose-*` class in `className` wins or loses by CSS order. */
	size?: "sm" | "base" | "lg";
}

const PROSE_SIZE = { sm: "prose-sm", base: "prose-base", lg: "prose-lg" } as const;

export function MarkdownRenderer({
	content,
	className = "",
	inline = false,
	size = "sm",
}: MarkdownRendererProps) {
	const prose = `prose ${PROSE_SIZE[size]} dark:prose-invert max-w-none`;
	if (inline) {
		return (
			<span className={`${prose} ${className}`}>
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
		<div className={`${prose} ${className}`}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeKatex]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
