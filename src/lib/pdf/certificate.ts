import PDFDocument from "pdfkit";
import { brand, certificates as certificatesCopy } from "@/lib/copy";
import { formatLongDate } from "@/lib/format";

export type CertificatePdfData = {
  code: string;
  title: string;
  studentName: string;
  schoolName: string;
  eventName: string | null;
  projectTitle: string | null;
  hours: number | null;
  issuedAt: Date;
  verifyUrl: string;
  qrPng: Buffer;
};

const INK = "#20231F";
const MUTED = "#62675F";
const BRAND = "#1F6B52";
const LINE = "#E3E4DE";
const MARGIN = 48;

function buildBody(data: CertificatePdfData): string {
  const subject =
    data.eventName ?? (data.projectTitle ? `projeto ${data.projectTitle}` : null);

  const parts: string[] = [];
  if (subject) parts.push(certificatesCopy.participatedIn(subject));
  if (data.eventName && data.projectTitle) parts.push(`com o projeto ${data.projectTitle}`);
  if (data.hours) parts.push(certificatesCopy.hoursText(data.hours));

  return parts.length > 0 ? `${parts.join(" ")}.` : "";
}

export function renderCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: MARGIN,
      info: { Title: `Certificado ${data.code}`, Author: brand.name },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - MARGIN * 2;

    doc.rect(0, 0, pageWidth, 14).fill(BRAND);
    doc
      .rect(MARGIN / 2, MARGIN / 2, pageWidth - MARGIN, pageHeight - MARGIN)
      .lineWidth(1)
      .stroke(LINE);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(MUTED)
      .text(brand.name.toUpperCase(), MARGIN, 74, { width: contentWidth, align: "center" });

    doc
      .font("Helvetica-Bold")
      .fontSize(32)
      .fillColor(BRAND)
      .text("Certificado", MARGIN, 96, { width: contentWidth, align: "center" });

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor(MUTED)
      .text("Certificamos que", MARGIN, 156, { width: contentWidth, align: "center" });

    doc
      .font("Helvetica-Bold")
      .fontSize(26)
      .fillColor(INK)
      .text(data.studentName, MARGIN, 180, { width: contentWidth, align: "center" });

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(INK)
      .text(data.title, MARGIN, 228, { width: contentWidth, align: "center" });

    const body = buildBody(data);
    if (body) {
      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor(MUTED)
        .text(body, MARGIN + 60, 256, { width: contentWidth - 120, align: "center" });
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(INK)
      .text(data.schoolName, MARGIN, 316, { width: contentWidth, align: "center" });

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(MUTED)
      .text(certificatesCopy.issuedAtText(formatLongDate(data.issuedAt)), MARGIN, 336, {
        width: contentWidth,
        align: "center",
      });

    const footerY = pageHeight - MARGIN - 96;
    doc.image(data.qrPng, MARGIN + 8, footerY, { width: 96, height: 96 });

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(INK)
      .text(`${certificatesCopy.codeLabel}: ${data.code}`, MARGIN + 118, footerY + 34, {
        width: contentWidth - 126,
      });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(MUTED)
      .text(data.verifyUrl, MARGIN + 118, footerY + 50, { width: contentWidth - 126 });

    doc.end();
  });
}
