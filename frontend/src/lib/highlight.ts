/**
 * A small syntax highlighter for the read-only code view. It only needs to make generated code
 * readable, so it recognises comments, strings, numbers, keywords and JSX tags, nothing more.
 */

export type Language = "ts" | "py" | "json" | "md" | "text";
export type TokenKind = "plain" | "comment" | "string" | "number" | "keyword" | "tag" | "heading";
export type Token = { kind: TokenKind; text: string };

const KEYWORDS: Record<Language, string[]> = {
  ts: [
    "import", "from", "export", "default", "function", "return", "const", "let", "if", "else", "for", "of", "in",
    "type", "interface", "new", "true", "false", "null", "undefined", "async", "await", "as", "typeof", "extends",
  ],
  py: [
    "import", "from", "def", "class", "return", "if", "elif", "else", "for", "in", "with", "as", "async", "await",
    "True", "False", "None", "and", "or", "not", "is", "try", "except", "raise", "pass", "lambda",
  ],
  json: ["true", "false", "null"],
  md: [],
  text: [],
};

const PATTERNS: Record<Language, RegExp> = {
  ts: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|(<\/?[A-Za-z][\w.]*)|([A-Za-z_$][\w$]*)/g,
  py: /(#[^\n]*)|("""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|(@[\w.]+)|([A-Za-z_][\w]*)/g,
  json: /()("(?:\\.|[^"\\\n])*")|(-?\b\d+(?:\.\d+)?\b)|()([A-Za-z]+)/g,
  md: /()()()()(^#{1,6} [^\n]*)/gm,
  text: /()()()()()/g,
};

export function languageFor(path: string): Language {
  if (/\.(tsx?|jsx?)$/.test(path)) return "ts";
  if (path.endsWith(".py")) return "py";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "md";
  return "text";
}

function tokenize(code: string, language: Language): Token[] {
  const tokens: Token[] = [];
  const keywords = new Set(KEYWORDS[language]);
  const pattern = new RegExp(PATTERNS[language].source, PATTERNS[language].flags);
  let last = 0;
  let match: RegExpExecArray | null;

  const push = (kind: TokenKind, text: string) => {
    if (text) tokens.push({ kind, text });
  };

  while ((match = pattern.exec(code)) !== null) {
    if (match[0] === "") {
      pattern.lastIndex += 1;
      continue;
    }
    push("plain", code.slice(last, match.index));
    const [, comment, string, number, tagOrDecorator, word] = match;
    if (comment) push("comment", comment);
    else if (string) push("string", string);
    else if (number) push("number", number);
    else if (tagOrDecorator) push("tag", tagOrDecorator);
    else if (word && language === "md") push("heading", word);
    else if (word) push(keywords.has(word) ? "keyword" : "plain", word);
    last = match.index + match[0].length;
  }
  push("plain", code.slice(last));
  return tokens;
}

/** Tokens grouped by line, so the viewer can show line numbers. */
export function highlightLines(code: string, language: Language): Token[][] {
  const lines: Token[][] = [[]];
  for (const token of tokenize(code, language)) {
    const parts = token.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ kind: token.kind, text: part });
    });
  }
  return lines;
}
