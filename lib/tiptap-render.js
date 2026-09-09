import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

const extensions = [
  StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3, 4] } }),
  Underline,
  Image.configure({ HTMLAttributes: { class: "tiptap-image" } }),
  Link.configure({ HTMLAttributes: { class: "tiptap-link", target: "_blank", rel: "noopener noreferrer" } }),
  TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  CodeBlockLowlight.configure({ lowlight }),
];

export async function renderTiptapToHtml(contentJson) {
  if (!contentJson) return "";
  return generateHTML(contentJson, extensions);
}