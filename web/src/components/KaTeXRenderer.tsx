import React, { useMemo } from 'react';
import katex from 'katex';

interface KaTeXRendererProps {
  math?: string | null;
  text?: string | null;
  displayMode?: boolean;
  className?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({
  math,
  text,
  displayMode = false,
  className = '',
}) => {
  // If dedicated math string is passed
  const renderedMath = useMemo(() => {
    if (!math) return null;
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      return math;
    }
  }, [math, displayMode]);

  // If text containing inline math ($...$) or block math ($$...$$) is passed
  const parsedContent = useMemo(() => {
    if (!text) return null;

    // Split text by $$...$$ (block) and $...$ (inline)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const rawFormula = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(rawFormula, { displayMode: true, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="block my-2" />;
        } catch (e) {
          return <span key={index} className="text-red-500">{part}</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const rawFormula = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(rawFormula, { displayMode: false, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="inline-block px-1" />;
        } catch (e) {
          return <span key={index} className="text-red-500">{part}</span>;
        }
      }
      return <span key={index}>{part}</span>;
    });
  }, [text]);

  if (math && renderedMath) {
    return (
      <span
        className={`protest-math ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedMath }}
      />
    );
  }

  if (text) {
    return <div className={`protest-formula-text ${className}`}>{parsedContent}</div>;
  }

  return null;
};
