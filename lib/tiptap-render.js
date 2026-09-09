import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

const extensions = [
  StarterKit.configure({ codeBlock: false }),
  Image.configure({ HTMLAttributes: { class: "tiptap-image" } }),
  Link.configure({ HTMLAttributes: { class: "tiptap-link", target: "_blank", rel: "noopener noreferrer" } }),
  CodeBlockLowlight.configure({ lowlight }),
];

export async function renderTiptapToHtml(contentJson) {
  if (!contentJson) return "";
  return generateHTML(contentJson, extensions);
}