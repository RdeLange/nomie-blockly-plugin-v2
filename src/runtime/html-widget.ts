// The HTML of a widget (phase 20): plain HTML with {{name}} placeholders, filled with the parameters a workspace sets.
// The HTML is cleaned before it is stored and again before it is shown: no scripts, no event handlers, no links, and
// images only from https. A parameter is written as text, so a value can never add markup.

const DROP = new Set(['script', 'style', 'iframe', 'frame', 'object', 'embed', 'noscript', 'template', 'link', 'meta', 'base', 'form', 'input', 'button', 'textarea', 'select', 'foreignobject', 'animate', 'set', 'use', 'image']);
const ATTRIBUTES = new Set([
  'class', 'style', 'title', 'alt', 'width', 'height', 'colspan', 'rowspan', 'src', 'scope',
  'viewbox', 'preserveaspectratio', 'xmlns', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points',
  'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'fill-opacity', 'transform',
  'font-size', 'font-weight', 'text-anchor', 'dominant-baseline', 'vector-effect',
]);
// a style that loads something or runs code is removed
const UNSAFE_STYLE = /url\s*\(|expression\s*\(|@import|behaviou?r\s*:|-moz-binding|javascript:|\\/i;

export const cleanWidgetHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;
  const clean = (node: Element) => {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toLowerCase();
      if (DROP.has(tag)) {
        child.remove();
        continue;
      }
      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase();
        const value = attr.value;
        const keep =
          ATTRIBUTES.has(name) &&
          !(name === 'style' && UNSAFE_STYLE.test(value)) &&
          !(name === 'src' && !/^https:\/\//i.test(value.trim()));
        if (!keep) child.removeAttribute(attr.name);
      }
      clean(child);
      // a tag that is not allowed is replaced by its text, so no content is lost
      if (!ALLOWED_TAGS.has(tag)) child.replaceWith(...Array.from(child.childNodes));
    }
  };
  clean(body);
  return body.innerHTML;
};

const ALLOWED_TAGS = new Set([
  'p', 'div', 'span', 'b', 'i', 'u', 'em', 'strong', 'small', 'br', 'hr', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'svg', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'path', 'g', 'text', 'section', 'header', 'footer', 'blockquote', 'code', 'pre', 'sub', 'sup', 'mark', 's', 'center',
]);

const escapeText = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Fills the placeholders of an HTML template. A value is escaped; a placeholder with no value is empty.
export const fillWidgetHtml = (template: string, params: Record<string, string>): string =>
  template.replace(/\{\{\s*([A-Za-z_][\w]*)\s*\}\}/g, (_, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? escapeText(String(params[name])) : '',
  );

// The page an HTML widget is shown in: a frame with no scripts (the frame has no sandbox permissions, and the policy
// allows only inline styles and https images). The text takes the colours of the widget.
export const htmlDocument = (html: string): string =>
  '<!doctype html><html><head><meta charset="utf-8">' +
  '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src https:; style-src \'unsafe-inline\'">' +
  '<style>html,body{margin:0;background:transparent;color:CanvasText;font:13px/1.35 -apple-system,BlinkMacSystemFont,sans-serif}' +
  'img{max-width:100%}table{border-collapse:collapse}td,th{padding:2px 4px}</style>' +
  `</head><body>${html}</body></html>`;
