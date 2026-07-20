/** Deterministic credential id from recipient + course, e.g. "TSU-4F9A2C". */
export function credentialId(name: string, course: string): string {
  const s = `${name.trim().toLowerCase()}|${course.trim().toLowerCase()}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(6, "0").slice(0, 6);
  return `TSU-${hex}`;
}

type CertData = {
  name: string;
  course: string;
  instructor: string;
  date: string;
  credId: string;
};

const NAVY = "#204555";
const ORANGE = "#ff4712";
const CREAM = "#fcfbf7";
const INK = "#334155";
const MUTED = "#64748b";

function setLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
  // letterSpacing is supported in modern Chromium/Safari; ignore if unavailable.
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
  } catch {
    /* noop */
  }
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/** Draws the full certificate onto a 1600×1140 canvas context. */
export function drawCertificate(ctx: CanvasRenderingContext2D, data: CertData) {
  const W = 1600;
  const H = 1140;
  const cx = W / 2;

  // Background
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // Double border
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 10;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.lineWidth = 3;
  ctx.strokeRect(54, 54, W - 108, H - 108);

  // Corner brackets
  ctx.strokeStyle = ORANGE;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 5;
  const L = 70;
  const off = 84;
  const corner = (x: number, y: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * L);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * L, y);
    ctx.stroke();
  };
  corner(off, off, 1, 1);
  corner(W - off, off, -1, 1);
  corner(off, H - off, 1, -1);
  corner(W - off, H - off, -1, -1);
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Kicker
  setLetterSpacing(ctx, 6);
  ctx.fillStyle = ORANGE;
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillText("TEKSKILLUP LEARNING CENTRE", cx, 150);
  setLetterSpacing(ctx, 0);

  // Title
  ctx.fillStyle = NAVY;
  ctx.font = "bold 66px Georgia, 'Times New Roman', serif";
  ctx.fillText("Certificate of Completion", cx, 250);

  // Subtitle
  ctx.fillStyle = MUTED;
  ctx.font = "italic 26px Georgia, serif";
  ctx.fillText("This certifies that", cx, 360);

  // Recipient name
  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 54px Georgia, serif";
  const name = data.name.trim() || "Your Name";
  ctx.fillText(name, cx, 450);
  // Underline
  const nameWidth = Math.min(ctx.measureText(name).width + 80, 900);
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - nameWidth / 2, 495);
  ctx.lineTo(cx + nameWidth / 2, 495);
  ctx.stroke();

  // Body
  ctx.fillStyle = INK;
  ctx.font = "26px Georgia, serif";
  const body =
    "has successfully completed all coursework, assessments and practice exams required to master the professional program:";
  const lines = wrapLines(ctx, body, 1040);
  lines.forEach((line, i) => ctx.fillText(line, cx, 570 + i * 42));

  // Course title
  setLetterSpacing(ctx, 3);
  ctx.fillStyle = NAVY;
  ctx.font = "bold 36px Arial, sans-serif";
  ctx.fillText(data.course.toUpperCase(), cx, 700 + (lines.length - 2) * 20);
  setLetterSpacing(ctx, 0);

  // Signature blocks
  const sigY = 900;
  const col = (colX: number, value: string, label: string, italic: boolean) => {
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(colX - 170, sigY + 18);
    ctx.lineTo(colX + 170, sigY + 18);
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.font = `${italic ? "italic " : ""}bold 26px Georgia, serif`;
    ctx.fillText(value, colX, sigY);
    setLetterSpacing(ctx, 3);
    ctx.fillStyle = MUTED;
    ctx.font = "600 15px Arial, sans-serif";
    ctx.fillText(label.toUpperCase(), colX, sigY + 46);
    setLetterSpacing(ctx, 0);
  };
  col(cx - 300, data.instructor, "Instructor", true);
  col(cx + 300, data.date, "Date Issued", false);

  // Seal (top-right)
  const sx = W - 250;
  const sy = 250;
  ctx.fillStyle = "rgba(249,115,22,0.10)";
  ctx.beginPath();
  ctx.arc(sx, sy, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ORANGE;
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sx, sy, 78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = ORANGE;
  star(ctx, sx, sy, 34);

  // Credential id
  setLetterSpacing(ctx, 2);
  ctx.fillStyle = MUTED;
  ctx.font = "600 18px Arial, sans-serif";
  ctx.fillText(
    `CREDENTIAL ID  ${data.credId}   ·   VERIFY AT TEKSKILLUP.COM/VERIFY`,
    cx,
    1010,
  );
  setLetterSpacing(ctx, 0);
}
