import Anthropic from "@anthropic-ai/sdk";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

const config = {
  anthropicKey: requireEnv("ANTHROPIC_API_KEY"),
  email: {
    host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT ?? "587"),
    user: requireEnv("EMAIL_USER"),
    pass: requireEnv("EMAIL_PASS"),
    to: requireEnv("EMAIL_TO"),
    fromName: process.env.EMAIL_FROM_NAME ?? "AI Research Agent",
  },
};

// ── Research Agent ────────────────────────────────────────────────────────────

interface ResearchResult {
  title: string;
  date: string;
  summary: string;
  sections: ResearchSection[];
}

interface ResearchSection {
  heading: string;
  content: string;
}

async function runResearchAgent(): Promise<ResearchResult> {
  const client = new Anthropic({ apiKey: config.anthropicKey });

  console.log("🔍 Starting AI news research...");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Today is ${today}. You are an AI research journalist.

Search the web thoroughly and compile a comprehensive briefing on the LATEST AI news and developments from the past 7 days. Cover:

1. **Major AI Model Releases & Updates** - New models, capability improvements, benchmarks
2. **Big Tech AI News** - Announcements from OpenAI, Google, Anthropic, Meta, Microsoft, Apple, etc.
3. **AI Research Breakthroughs** - Notable papers, scientific discoveries, new techniques
4. **AI Industry & Business** - Funding rounds, acquisitions, partnerships, regulatory news
5. **AI Tools & Applications** - New products, open-source releases, developer tools

For each item, include:
- What happened
- Why it matters
- Key details/numbers

Search for multiple topics to get comprehensive coverage. Be specific with dates, numbers, and facts.
After researching, provide a well-structured summary with clear sections.`,
    },
  ];

  let response!: Anthropic.Message;
  let iterations = 0;
  const maxIterations = 10;

  // Agentic loop — web_search is server-side; API handles searches automatically.
  // We re-send on "pause_turn" (server hit its 10-iteration limit) until "end_turn".
  while (iterations < maxIterations) {
    iterations++;

    response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages,
    });

    // Append assistant turn for the next iteration
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      break;
    }

    // pause_turn: server-side tool loop hit its limit — re-send to continue
    if (response.stop_reason === "pause_turn") {
      // Log which searches are happening
      for (const block of response.content) {
        if (block.type === "server_tool_use") {
          const input = block.input as Record<string, unknown>;
          console.log(`  🌐 Searching: ${String(input.query ?? block.name)}`);
        }
      }
      continue;
    }

    break;
  }

  // Extract the final text response
  const fullText = response!.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");

  if (!fullText.trim()) {
    throw new Error("Agent returned no text content");
  }

  console.log("✅ Research complete. Parsing results...");

  // Use Claude to structure the raw research into clean JSON
  const structureResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `Convert the following AI news briefing into a structured JSON object.

The JSON must follow this exact TypeScript interface:
{
  title: string;           // e.g. "AI News Briefing — April 16, 2026"
  date: string;            // today's full date
  summary: string;         // 2-3 sentence executive summary of the biggest stories
  sections: Array<{
    heading: string;       // section title
    content: string;       // full section text, well-formatted with bullet points
  }>;
}

Here is the briefing to convert:
---
${fullText}
---

Respond with ONLY the raw JSON object, no markdown fences, no explanation.`,
      },
    ],
  });

  const jsonText = structureResponse.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  // Strip markdown fences if present
  const cleaned = jsonText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  const result: ResearchResult = JSON.parse(cleaned);
  return result;
}

// ── PDF Generator ─────────────────────────────────────────────────────────────

async function generatePDF(research: ResearchResult, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: research.title,
        Author: "AI Research Agent",
        Subject: "AI News Briefing",
      },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const pageWidth = doc.page.width - 120; // account for margins

    // ── Header ──
    doc
      .rect(0, 0, doc.page.width, 110)
      .fill("#0f172a");

    doc
      .fontSize(24)
      .fillColor("#f8fafc")
      .font("Helvetica-Bold")
      .text(research.title, 60, 35, { width: pageWidth });

    doc
      .fontSize(11)
      .fillColor("#94a3b8")
      .font("Helvetica")
      .text(`Generated by AI Research Agent · ${research.date}`, 60, 75, { width: pageWidth });

    doc.moveDown(3);

    // ── Executive Summary ──
    doc
      .roundedRect(55, doc.y, pageWidth + 10, 10, 4)
      .fill("#eff6ff");

    const summaryY = doc.y + 15;
    doc
      .fontSize(12)
      .fillColor("#1e40af")
      .font("Helvetica-Bold")
      .text("📋  EXECUTIVE SUMMARY", 65, summaryY);

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#1e293b")
      .font("Helvetica")
      .text(research.summary, 65, doc.y, { width: pageWidth - 10, lineGap: 4 });

    doc.moveDown(2);

    // ── Sections ──
    for (const section of research.sections) {
      // Check if we need a new page
      if (doc.y > doc.page.height - 160) {
        doc.addPage();
      }

      // Section header bar
      doc
        .rect(55, doc.y, pageWidth + 10, 28)
        .fill("#1e293b");

      doc
        .fontSize(12)
        .fillColor("#f8fafc")
        .font("Helvetica-Bold")
        .text(section.heading, 65, doc.y - 20, { width: pageWidth - 10 });

      doc.moveDown(1.2);

      // Section content
      const lines = section.content.split("\n");
      for (const line of lines) {
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }

        const trimmed = line.trim();
        if (!trimmed) {
          doc.moveDown(0.4);
          continue;
        }

        if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
          doc
            .fontSize(11)
            .fillColor("#0f172a")
            .font("Helvetica-Bold")
            .text(trimmed.replace(/\*\*/g, ""), 65, doc.y, { width: pageWidth - 10, lineGap: 3 });
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          doc
            .fontSize(10.5)
            .fillColor("#334155")
            .font("Helvetica")
            .text(`• ${trimmed.replace(/^[-•]\s+/, "")}`, 75, doc.y, {
              width: pageWidth - 20,
              lineGap: 3,
              indent: 0,
            });
        } else {
          doc
            .fontSize(10.5)
            .fillColor("#334155")
            .font("Helvetica")
            .text(trimmed, 65, doc.y, { width: pageWidth - 10, lineGap: 3 });
        }
        doc.moveDown(0.3);
      }

      doc.moveDown(1.5);
    }

    // ── Footer on last page ──
    doc
      .fontSize(9)
      .fillColor("#94a3b8")
      .font("Helvetica")
      .text(
        `This briefing was automatically generated by an AI research agent powered by Claude. Always verify information from primary sources.`,
        60,
        doc.page.height - 50,
        { width: pageWidth, align: "center" }
      );

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

// ── Email Sender ──────────────────────────────────────────────────────────────

async function sendEmail(research: ResearchResult, pdfPath: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: #0f172a; padding: 32px; }
    .header h1 { color: #f8fafc; margin: 0; font-size: 22px; }
    .header p { color: #94a3b8; margin: 8px 0 0; font-size: 14px; }
    .summary-box { background: #eff6ff; border-left: 4px solid #2563eb; margin: 24px; padding: 16px; border-radius: 4px; }
    .summary-box h3 { color: #1e40af; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-box p { color: #1e293b; margin: 0; font-size: 14px; line-height: 1.6; }
    .section { margin: 0 24px 20px; }
    .section h2 { font-size: 15px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .section p { font-size: 14px; color: #475569; line-height: 1.6; }
    .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
    .badge { display: inline-block; background: #2563eb; color: white; font-size: 11px; padding: 3px 8px; border-radius: 99px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">AI BRIEFING</span>
      <h1>${research.title}</h1>
      <p>${research.date} · Powered by Claude</p>
    </div>

    <div style="padding: 8px 0;">
      <div class="summary-box">
        <h3>📋 Executive Summary</h3>
        <p>${research.summary}</p>
      </div>

      ${research.sections
        .slice(0, 3)
        .map(
          (s) => `
      <div class="section">
        <h2>${s.heading}</h2>
        <p>${s.content.split("\n").slice(0, 6).join("<br>").replace(/\*\*/g, "").substring(0, 600)}...</p>
      </div>`
        )
        .join("")}

      <div style="margin: 24px; background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
        <p style="color: #475569; font-size: 14px; margin: 0 0 4px;">📎 Full briefing attached as PDF</p>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Contains all ${research.sections.length} sections with complete details</p>
      </div>
    </div>

    <div class="footer">
      <p>Auto-generated by AI Research Agent · Verify information from primary sources</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"${config.email.fromName}" <${config.email.user}>`,
    to: config.email.to,
    subject: `📰 ${research.title}`,
    html,
    attachments: [
      {
        filename: path.basename(pdfPath),
        path: pdfPath,
        contentType: "application/pdf",
      },
    ],
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🤖 AI Web Research Agent starting...\n");

  // Step 1: Research
  const research = await runResearchAgent();
  console.log(`📰 Briefing: "${research.title}"`);
  console.log(`   ${research.sections.length} sections compiled\n`);

  // Step 2: Generate PDF
  const pdfFilename = `ai-briefing-${new Date().toISOString().split("T")[0]}.pdf`;
  const pdfPath = path.join(__dirname, pdfFilename);

  console.log("📄 Generating PDF...");
  await generatePDF(research, pdfPath);
  const pdfSize = (fs.statSync(pdfPath).size / 1024).toFixed(1);
  console.log(`   Saved: ${pdfFilename} (${pdfSize} KB)\n`);

  // Step 3: Send email
  console.log(`📧 Sending email to ${config.email.to}...`);
  await sendEmail(research, pdfPath);
  console.log("   Email sent successfully!\n");

  // Cleanup temp PDF
  fs.unlinkSync(pdfPath);

  console.log("✅ Done! Your AI briefing has been delivered.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message ?? err);
  process.exit(1);
});
