import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

/**
 * Convert markdown text to DOCX format
 * @param {string} markdown - Markdown content
 * @param {string} title - Document title
 * @returns {Promise<Blob>} DOCX file as Blob
 */
export async function markdownToDocx(markdown, title = "Template") {
 const paragraphs = [];
 
 // Split markdown into lines
 const lines = markdown.split("\n");
 
 for (let i = 0; i < lines.length; i++) {
 const line = lines[i].trim();
 
 // Skip empty lines
 if (!line) {
 paragraphs.push(new Paragraph({ text: "" }));
 continue;
 }
 
 // Handle headings
 if (line.startsWith("# ")) {
 paragraphs.push(
 new Paragraph({
 text: line.substring(2),
 heading: HeadingLevel.HEADING_1,
 })
 );
 } else if (line.startsWith("## ")) {
 paragraphs.push(
 new Paragraph({
 text: line.substring(3),
 heading: HeadingLevel.HEADING_2,
 })
 );
 } else if (line.startsWith("### ")) {
 paragraphs.push(
 new Paragraph({
 text: line.substring(4),
 heading: HeadingLevel.HEADING_3,
 })
 );
 } else if (line.startsWith("#### ")) {
 paragraphs.push(
 new Paragraph({
 text: line.substring(5),
 heading: HeadingLevel.HEADING_4,
 })
 );
 } else if (line.startsWith("---")) {
 // Horizontal rule - add spacing
 paragraphs.push(new Paragraph({ text: "" }));
 paragraphs.push(new Paragraph({ text: "" }));
 } else if (line.startsWith("- ") || line.startsWith("* ")) {
 // Bullet point
 const bulletText = line.substring(2);
 paragraphs.push(
 new Paragraph({
 text: bulletText,
 bullet: { level: 0 },
 })
 );
 } else if (line.startsWith("**") && line.endsWith("**")) {
 // Bold text
 const boldText = line.substring(2, line.length - 2);
 paragraphs.push(
 new Paragraph({
 children: [
 new TextRun({
 text: boldText,
 bold: true,
 }),
 ],
 })
 );
 } else if (line.startsWith("```")) {
 // Code block - skip opening/closing markers, treat as plain text
 continue;
 } else {
 // Regular paragraph
 // Handle inline bold (**text**) and other formatting
 const parts = [];
 let remaining = line;
 let boldStart = remaining.indexOf("**");
 
 while (boldStart !== -1) {
 // Add text before bold
 if (boldStart > 0) {
 parts.push(new TextRun({ text: remaining.substring(0, boldStart) }));
 }
 
 // Find closing **
 const boldEnd = remaining.indexOf("**", boldStart + 2);
 if (boldEnd !== -1) {
 const boldText = remaining.substring(boldStart + 2, boldEnd);
 parts.push(new TextRun({ text: boldText, bold: true }));
 remaining = remaining.substring(boldEnd + 2);
 } else {
 // No closing, treat as regular text
 parts.push(new TextRun({ text: remaining.substring(boldStart) }));
 remaining = "";
 }
 
 boldStart = remaining.indexOf("**");
 }
 
 // Add remaining text
 if (remaining) {
 parts.push(new TextRun({ text: remaining }));
 }
 
 if (parts.length > 0) {
 paragraphs.push(new Paragraph({ children: parts }));
 } else {
 paragraphs.push(new Paragraph({ text: line }));
 }
 }
 }
 
 // Create document
 const doc = new Document({
 sections: [
 {
 properties: {},
 children: paragraphs,
 },
 ],
 });
 
 // Generate DOCX blob
 const blob = await Packer.toBlob(doc);
 return blob;
}

