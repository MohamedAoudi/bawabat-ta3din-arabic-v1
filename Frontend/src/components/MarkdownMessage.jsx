import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * MarkdownMessage — renders a chatbot answer written in Markdown.
 *
 * The AMIP chatbot replies in GitHub-flavored Markdown (headings, bold,
 * lists, and pipe tables). Rendering that string raw makes the user see the
 * literal `#`, `**`, and unaligned `|` characters, so we parse it here.
 *
 * Security: react-markdown does NOT render embedded raw HTML, so model output
 * cannot inject markup. We only widen that surface for links, which we force
 * to open safely in a new tab.
 *
 * Styling lives in `.amip-md` (index.css) and reacts to the two theme tokens
 * passed in as CSS variables, so the same component looks right in light and
 * dark mode and in both LTR and RTL (Arabic) layouts.
 */
const MarkdownMessage = ({ text, isDarkMode = false, isArabic = false, textColor }) => {
  const vars = isDarkMode
    ? {
        "--md-text": textColor || "#efe8d4",
        "--md-muted": "rgba(239,232,212,0.55)",
        "--md-accent": "#d3b468",
        "--md-border": "rgba(201,168,76,0.22)",
        "--md-code-bg": "rgba(255,255,255,0.08)",
        "--md-table-head": "rgba(201,168,76,0.18)",
        "--md-table-stripe": "rgba(255,255,255,0.035)",
      }
    : {
        "--md-text": textColor || "#082721",
        "--md-muted": "rgba(8,39,33,0.55)",
        "--md-accent": "#a8894c",
        "--md-border": "rgba(8,39,33,0.14)",
        "--md-code-bg": "rgba(8,39,33,0.06)",
        "--md-table-head": "rgba(201,168,76,0.16)",
        "--md-table-stripe": "rgba(8,39,33,0.025)",
      };

  return (
    <div
      className={`amip-md${isArabic ? " amip-md-rtl" : ""}`}
      style={vars}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Tables can be wider than the bubble; let them scroll horizontally
          // instead of squashing columns into unreadable wraps.
          table: ({ node, ...props }) => (
            <div className="amip-md-table-wrap">
              <table {...props} />
            </div>
          ),
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
