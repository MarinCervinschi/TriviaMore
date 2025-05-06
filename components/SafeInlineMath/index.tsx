import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface SmartInlineMathProps {
    text: string;
}

export default function SmartInlineMath({ text }: SmartInlineMathProps) {
    const parts = text.split(/(\$[^$]+\$)/g); // Split by inline LaTeX

    return (
        <>
            {parts.map((part, index) => {
                const match = part.match(/^\$(.*)\$$/);
                if (match) {
                    try {
                        return <InlineMath key={index} math={match[1]} />;
                    } catch {
                        return <span key={index} className="text-red-600">{match[1]}</span>;
                    }
                } else {
                    return <span key={index}>{part}</span>;
                }
            })}
        </>
    );
}