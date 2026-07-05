import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function tryParseString(input) {
    if (typeof input !== "string") return input;

    // Try parsing JSON strings
    const looksLikeJson = /^\s*[\[{"]/.test(input);

    if (looksLikeJson) {
        try {
            return JSON.parse(input);
        } catch {
            // Ignore parse errors
        }
    }

    return input;
}

function unescapeCommonSequences(text) {
    if (typeof text !== "string") return text;

    return text
        .replace(/\\r\\n/g, "\r\n")
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t");
}

function formatAIResponse(obj) {
    if (!obj) return "";

    // AI returned { fileName, code }
    if (obj.fileName && obj.code) {
        const lang =
            (obj.fileName.split(".").pop() || "").replace(/[^a-zA-Z0-9]/g, "");

        const code =
            typeof obj.code === "string"
                ? unescapeCommonSequences(obj.code)
                : String(obj.code);

        return `## ${obj.fileName}

\`\`\`${lang}
${code}
\`\`\`
`;
    }

    // AI returned only code
    if (obj.code) {
        const code =
            typeof obj.code === "string"
                ? unescapeCommonSequences(obj.code)
                : String(obj.code);

        const isJson = /^\s*\{/.test(code) || /^\s*\[/.test(code);
        const lang = isJson ? "json" : "javascript";

        return `\`\`\`${lang}
${code}
\`\`\``;
    }

    // Any other object
    try {
        return `\`\`\`json
${JSON.stringify(obj, null, 2)}
\`\`\``;
    } catch {
        return String(obj);
    }
}

function MarkdownRenderer({ children, className = "" }) {
    let markdownContent = children;

    if (typeof markdownContent === "object" && markdownContent !== null) {
        markdownContent = formatAIResponse(markdownContent);
    } else if (typeof markdownContent === "string") {
        markdownContent = unescapeCommonSequences(markdownContent);
    }

    return (
        <div
            className={`prose prose-invert prose-slate max-w-none
    prose-headings:text-cyan-300
    prose-p:text-slate-200
    prose-strong:text-white
    prose-em:text-cyan-200
    prose-a:text-cyan-400
    prose-a:no-underline hover:prose-a:underline
    prose-code:text-pink-400
    prose-code:bg-slate-800
    prose-code:px-1
    prose-code:py-0.5
    prose-code:rounded
    prose-code:before:content-none
    prose-code:after:content-none
    prose-li:text-slate-200
    prose-ul:marker:text-cyan-400
    prose-ol:marker:text-cyan-400
    prose-blockquote:border-cyan-500
    prose-blockquote:text-slate-300
    ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-cyan-300 mb-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-cyan-300 mt-6 mb-3">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-semibold text-cyan-200 mt-5 mb-2">{children}</h3>
                    ),
                    code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");

                        if (!inline) {
                            return (
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match ? match[1] : "javascript"}
                                    PreTag="div"
                                    customStyle={{
                                        borderRadius: "1rem",
                                        padding: "1rem",
                                        background: "#1e293b",
                                    }}
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            );
                        }

                        return (
                            <code
                                className="rounded bg-slate-800 px-1.5 py-0.5 text-pink-400"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {markdownContent}
            </ReactMarkdown>
        </div>
    );
}

export default memo(MarkdownRenderer);