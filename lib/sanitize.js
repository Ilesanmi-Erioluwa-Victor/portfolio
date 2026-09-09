import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "span",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
];

const ALLOWED_ATTRIBUTES = {
  a: ["href", "title", "target", "rel", "class"],
  img: ["src", "alt", "title", "width", "height", "class", "data-align"],
  code: ["class"],
  span: ["class"],
  pre: ["class"],
  th: ["colspan", "rowspan"],
  td: ["colspan", "rowspan"],
  p: ["style"],
  h1: ["style"],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  h5: ["style"],
  h6: ["style"],
};

const ALLOWED_SCHEMES = ["http", "https", "mailto", "tel"];

const ALLOWED_STYLES = {
  "*": {
    "text-align": [/^left$/, /^center$/, /^right$/, /^justify$/],
  },
};

export const SANITIZE_RULES = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ALLOWED_SCHEMES,
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
  allowedStyles: ALLOWED_STYLES,
  allowProtocolRelative: false,
};

export function sanitizePostHtml(html) {
  if (typeof html !== "string" || !html) return "";
  return sanitizeHtml(html, SANITIZE_RULES);
}
