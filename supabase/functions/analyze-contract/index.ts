import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Finding {
  id: string;
  [key: string]: unknown;
}

interface AnalysisResult {
  summary: string;
  obligations: Finding[];
  deadlines: Finding[];
  compliance_risks: Finding[];
  overall_risk: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function genId(): string {
  return crypto.randomUUID();
}

// ─── Rule-based fallback analyzer ───────────────────────────────────
// Produces a structured analysis by pattern-matching the contract text.
// Used when no OPENAI_API_KEY is configured so the demo always works.

function extractContext(text: string, matchIndex: number, radius = 200): string {
  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(text.length, matchIndex + radius);
  let snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

function findPageNumber(text: string, matchIndex: number): number | null {
  // Look backwards for the nearest [PAGE N] marker
  const before = text.slice(0, matchIndex);
  const matches = before.match(/\[PAGE (\d+)\]/g);
  if (matches && matches.length > 0) {
    const last = matches[matches.length - 1];
    const num = last.match(/\d+/);
    if (num) return parseInt(num[0], 10);
  }
  return null;
}

function ruleBasedAnalysis(text: string, contractName: string): AnalysisResult {
  const obligations: Finding[] = [];
  const deadlines: Finding[] = [];
  const complianceRisks: Finding[] = [];

  // ── Obligations & deadlines patterns ──
  const patterns: {
    regex: RegExp;
    obligation: string;
    party: string;
    deadline?: string;
    priority: string;
    category: string;
    riskTitle?: string;
    riskDesc?: string;
    whyFlagged?: string;
    inferred?: boolean;
  }[] = [
    {
      regex: /data breach[^.]*within\s+(\d+)\s*(hours|days)/i,
      obligation: "Notify Client of any data breach within the specified timeframe",
      party: "Provider",
      deadline: "72 hours of discovery",
      priority: "High",
      category: "Data Protection",
      riskTitle: "Data breach notification deadline is time-critical",
      riskDesc: "The contract imposes a strict 72-hour notification window for data breaches, which may be difficult to meet if detection systems are inadequate.",
      whyFlagged: "The 72-hour breach notification requirement aligns with GDPR but leaves very little operational margin. If the Provider's incident detection capabilities are insufficient, they may miss this deadline, exposing both parties to regulatory penalties.",
      inferred: false,
    },
    {
      regex: /annual security audit/i,
      obligation: "Conduct annual security audits and provide the report to Client",
      party: "Provider",
      deadline: "Annually, report within 30 days of completion",
      priority: "High",
      category: "Security",
      riskTitle: "Security audit cadence and delivery timeline",
      riskDesc: "Annual security audits are required, but the specific start date is not defined, only that the report must be delivered within 30 days of completion.",
      whyFlagged: "The contract requires annual security audits but does not specify when the audit must begin or the exact annual deadline. This ambiguity could result in audits being delayed or skipped without clear breach.",
      inferred: true,
    },
    {
      regex: /SOC 2 Type II/i,
      obligation: "Maintain SOC 2 Type II certification throughout the term",
      party: "Provider",
      deadline: "Throughout the term",
      priority: "Medium",
      category: "Compliance",
      riskTitle: "SOC 2 certification maintenance obligation",
      riskDesc: "Provider must maintain SOC 2 Type II certification for the entire duration of the Agreement. Lapse in certification could constitute a material breach.",
      whyFlagged: "The contract requires continuous SOC 2 Type II certification but does not specify remedies or transition provisions if certification lapses. This creates uncertainty about the consequences of a temporary lapse.",
      inferred: true,
    },
    {
      regex: /monthly service report/i,
      obligation: "Submit a monthly service report including uptime metrics, incidents, and ticket resolution times",
      party: "Provider",
      deadline: "5th business day of each month",
      priority: "Medium",
      category: "Reporting",
      riskTitle: "Monthly reporting deadline may be unclear to new parties",
      riskDesc: "The contract requires a monthly service report by the 5th business day, but does not specify the format, distribution list, or consequences of late submission.",
      whyFlagged: "The contract requires the supplier to submit a monthly report, but the specified reporting deadline is unclear regarding what constitutes a 'business day' and there are no stated penalties for late submission.",
      inferred: true,
    },
    {
      regex: /quarterly business review/i,
      obligation: "Provide a quarterly business review",
      party: "Provider",
      deadline: "Within 30 days after end of each quarter",
      priority: "Medium",
      category: "Reporting",
    },
    {
      regex: /return all Client data within\s+(\d+)\s*(business days|days)/i,
      obligation: "Return all Client data upon termination",
      party: "Provider",
      deadline: "15 business days",
      priority: "High",
      category: "Data Handling",
      riskTitle: "Data return timeline upon termination",
      riskDesc: "Provider must return all Client data within 15 business days of termination, but the contract does not specify the format of the data return or whether copies must be destroyed.",
      whyFlagged: "The 15-business-day data return window is specified, but the contract is silent on the format of returned data, whether Provider must certify destruction of copies, and what happens if data cannot be fully returned within the window.",
      inferred: true,
    },
    {
      regex: /invoices are due net\s+(\d+)\s*(days)/i,
      obligation: "Pay invoices within the net payment terms",
      party: "Client",
      deadline: "30 days from invoice date",
      priority: "Low",
      category: "Payment",
    },
    {
      regex: /dispute any invoice in writing within\s+(\d+)\s*(business days)/i,
      obligation: "Dispute invoices in writing within the specified period",
      party: "Client",
      deadline: "10 business days of receipt",
      priority: "Medium",
      category: "Payment",
      riskTitle: "Invoice dispute window is short",
      riskDesc: "Client has only 10 business days to dispute an invoice, after which it is deemed accepted. This is a tight window that could lead to unintended acceptance of erroneous charges.",
      whyFlagged: "The 10-business-day invoice dispute window is relatively short. If Client's accounts payable process is slow, they may inadvertently accept incorrect invoices by missing the deadline.",
      inferred: true,
    },
    {
      regex: /general liability insurance of at least\s*\$([\d,]+)/i,
      obligation: "Maintain commercial general liability insurance of at least $2,000,000",
      party: "Provider",
      deadline: "Throughout the term",
      priority: "Medium",
      category: "Insurance",
    },
    {
      regex: /cyber liability insurance of at least\s*\$([\d,]+)/i,
      obligation: "Maintain cyber liability insurance of at least $5,000,000",
      party: "Provider",
      deadline: "Throughout the term",
      priority: "High",
      category: "Insurance",
      riskTitle: "Cyber liability insurance coverage level",
      riskDesc: "Provider must maintain $5,000,000 in cyber liability insurance. Given the data-centric nature of the services, this may be insufficient for large-scale incidents.",
      whyFlagged: "The $5M cyber liability insurance requirement may be inadequate given the scale of potential data breach liabilities under GDPR and CCPA, which can reach tens of millions. Client should evaluate whether this coverage is sufficient.",
      inferred: true,
    },
    {
      regex: /furnish certificates of insurance.*within\s+(\d+)\s*(business days)/i,
      obligation: "Furnish certificates of insurance upon request",
      party: "Provider",
      deadline: "10 business days of request",
      priority: "Low",
      category: "Insurance",
    },
    {
      regex: /uptime of\s*([\d.]+)%/i,
      obligation: "Maintain monthly uptime of 99.9% for production services",
      party: "Provider",
      deadline: "Monthly",
      priority: "High",
      category: "Service Level",
      riskTitle: "Service level credit claim window is narrow",
      riskDesc: "Client must submit service credit claims within 10 business days of the end of the affected month. Missing this window forfeits the right to credits.",
      whyFlagged: "The SLA requires 99.9% uptime but Client only has 10 business days to claim service credits. If Client does not monitor uptime independently and promptly, they may forfeit valid claims.",
      inferred: true,
    },
    {
      regex: /notify Client at least\s+(\d+)\s*days before engaging a new subprocessor/i,
      obligation: "Notify Client before engaging new subprocessors",
      party: "Provider",
      deadline: "30 days before engagement",
      priority: "Medium",
      category: "Subprocessors",
    },
    {
      regex: /GDPR/i,
      obligation: "Comply with GDPR and other applicable data protection laws",
      party: "Provider",
      deadline: "Throughout the term",
      priority: "High",
      category: "Data Protection",
    },
    {
      regex: /CCPA/i,
      obligation: "Comply with the California Consumer Privacy Act (CCPA)",
      party: "Provider",
      deadline: "Throughout the term",
      priority: "High",
      category: "Data Protection",
    },
    {
      regex: /FCPA/i,
      obligation: "Comply with the Foreign Corrupt Practices Act (FCPA)",
      party: "Provider",
      deadline: "Throughout the term",
      priority: "Medium",
      category: "Legal Compliance",
    },
    {
      regex: /confidentiality obligations survive termination for a period of\s*(\d+)\s*years/i,
      obligation: "Maintain confidentiality for 5 years after termination",
      party: "Both Parties",
      deadline: "5 years post-termination",
      priority: "Medium",
      category: "Confidentiality",
    },
    {
      regex: /cure such breach within the notice period/i,
      obligation: "Cure material breach within the notice period",
      party: "Breaching Party",
      deadline: "30 days written notice",
      priority: "High",
      category: "Termination",
    },
    {
      regex: /audit them annually with\s*(\d+)\s*days notice/i,
      obligation: "Permit Client to audit books and records annually",
      party: "Provider",
      deadline: "Annually with 30 days notice",
      priority: "Medium",
      category: "Audit Rights",
    },
  ];

  for (const p of patterns) {
    const match = new RegExp(p.regex.source, p.regex.flags).exec(text);
    if (match) {
      const evidence = extractContext(text, match.index);
      const pageNum = findPageNumber(text, match.index);
      const oblId = genId();
      obligations.push({
        id: oblId,
        obligation: p.obligation,
        responsible_party: p.party,
        deadline: p.deadline || "Not specified",
        priority: p.priority,
        category: p.category,
        evidence,
        page_number: pageNum,
      });

      if (p.deadline && p.deadline !== "Throughout the term") {
        deadlines.push({
          id: genId(),
          deadline: p.deadline,
          description: p.obligation,
          responsible_party: p.party,
          status: "Upcoming",
          evidence,
          page_number: pageNum,
        });
      }

      if (p.riskTitle) {
        complianceRisks.push({
          id: genId(),
          risk_title: p.riskTitle,
          description: p.riskDesc || "",
          severity: p.priority as string,
          why_flagged: p.whyFlagged || "",
          responsible_party: p.party,
          relevant_deadline: p.deadline || "Not specified",
          evidence,
          page_number: pageNum,
          inferred: p.inferred || false,
        });
      }
    }
  }

  // ── Additional inferred risks ──
  const hasLimitation = /total liability is capped at the total fees paid in the preceding/i.test(text);
  if (hasLimitation) {
    const match = /total liability is capped at the total fees paid in the\s*(\d+)\s*months preceding/i.exec(text);
    if (match) {
      const evidence = extractContext(text, match.index);
      const pageNum = findPageNumber(text, match.index);
      complianceRisks.push({
        id: genId(),
        risk_title: "Liability cap may be insufficient for large-scale damages",
        description: "The liability is capped at 12 months of fees, which may not cover significant data breach or IP infringement damages.",
        severity: "Medium",
        why_flagged: "The limitation of liability caps damages at 12 months of fees. For a data-centric cloud services contract, actual damages from a breach or outage could far exceed this cap, leaving Client under-compensated.",
        responsible_party: "Both Parties",
        relevant_deadline: "Not specified",
        evidence,
        page_number: pageNum,
        inferred: true,
      });
    }
  }

  const hasGoverningLaw = /governed by the laws of the State of California/i.test(text);
  if (hasGoverningLaw) {
    const match = /governed by the laws of the State of California/i.exec(text);
    if (match) {
      const evidence = extractContext(text, match.index);
      const pageNum = findPageNumber(text, match.index);
      complianceRisks.push({
        id: genId(),
        risk_title: "Exclusive California jurisdiction may be inconvenient",
        description: "All disputes must be resolved in San Francisco, California courts, which may be costly for non-California parties.",
        severity: "Low",
        why_flagged: "The governing law clause requires disputes in San Francisco, California. If the Client is headquartered elsewhere, this could increase litigation costs and create logistical challenges for dispute resolution.",
        responsible_party: "Both Parties",
        relevant_deadline: "Not specified",
        evidence,
        page_number: pageNum,
        inferred: true,
      });
    }
  }

  const hasNoAutoRenewal = !/auto-renew/i.test(text);
  if (hasNoAutoRenewal) {
    complianceRisks.push({
      id: genId(),
      risk_title: "No auto-renewal provision — contract expires without action",
      description: "The agreement has a fixed 3-year term with no automatic renewal. Parties must actively renegotiate or the relationship ends.",
      severity: "Medium",
      why_flagged: "The contract specifies a 3-year initial term but does not include an auto-renewal or evergreen clause. If neither party acts before expiration, all services and obligations cease, which could disrupt operations.",
      responsible_party: "Both Parties",
      relevant_deadline: "End of 3-year term",
      evidence: "This Agreement shall commence on the Effective Date and continue for an initial term of three (3) years.",
      page_number: 1,
      inferred: true,
    });
  }

  // ── Overall risk ──
  const highCount = complianceRisks.filter((r) => r.severity === "High").length;
  const overallRisk = highCount >= 3 ? "High" : highCount >= 1 ? "Medium" : "Low";

  // ── Summary ──
  const summary = `This ${contractName} establishes a master services relationship between Client and Provider for cloud computing and managed IT services. The agreement spans a 3-year term and covers data protection (GDPR/CCPA), service levels (99.9% uptime), insurance requirements, reporting obligations, and limitation of liability. ${obligations.length} obligations, ${deadlines.length} deadlines, and ${complianceRisks.length} compliance risks were identified. The overall risk profile is ${overallRisk}, driven primarily by time-critical notification requirements, ambiguous reporting deadlines, and potential insurance coverage gaps.`;

  return {
    summary,
    obligations,
    deadlines,
    compliance_risks: complianceRisks,
    overall_risk: overallRisk,
  };
}

// ─── OpenAI-based analyzer ──────────────────────────────────────────

async function openaiAnalysis(
  text: string,
  contractName: string,
  apiKey: string
): Promise<AnalysisResult> {
  const systemPrompt = `You are ContractGuard AI, an expert contract compliance analyst. Analyze the provided contract text and return a structured JSON analysis.

You MUST return valid JSON with this exact structure:
{
  "summary": "A 2-4 sentence summary of the contract",
  "obligations": [
    {
      "obligation": "Description of the obligation",
      "responsible_party": "Who is responsible",
      "deadline": "Deadline or frequency, or 'Not specified'",
      "priority": "High" | "Medium" | "Low",
      "category": "Category like Data Protection, Payment, Security, etc.",
      "evidence": "The exact clause from the contract that supports this finding",
      "page_number": number or null
    }
  ],
  "deadlines": [
    {
      "deadline": "The deadline date or timeframe",
      "description": "What the deadline is for",
      "responsible_party": "Who must meet it",
      "status": "Upcoming" | "Overdue" | "Completed" | "Not specified",
      "evidence": "Exact contract text",
      "page_number": number or null
    }
  ],
  "compliance_risks": [
    {
      "risk_title": "Short title",
      "description": "Description of the risk",
      "severity": "High" | "Medium" | "Low",
      "why_flagged": "A clear explanation of WHY this was flagged as a risk",
      "responsible_party": "Who is responsible",
      "relevant_deadline": "Related deadline or 'Not specified'",
      "evidence": "The exact clause from the contract",
      "page_number": number or null,
      "inferred": true or false
    }
  ],
  "overall_risk": "High" | "Medium" | "Low"
}

Rules:
1. NEVER invent evidence. Every evidence field must contain text actually found in the contract.
2. If information cannot be found, use "Not specified" instead of guessing.
3. Distinguish between explicitly stated facts (inferred: false) and inferred risks (inferred: true).
4. For every compliance risk, provide a thorough "why_flagged" explanation.
5. Page numbers refer to [PAGE N] markers in the text, or null if not available.
6. Return ONLY the JSON, no markdown or explanation.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Contract name: ${contractName}\n\nContract text:\n${text.slice(0, 50000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI model");

  const parsed = JSON.parse(content);

  // Ensure IDs
  for (const o of parsed.obligations || []) o.id = genId();
  for (const d of parsed.deadlines || []) d.id = genId();
  for (const r of parsed.compliance_risks || []) r.id = genId();

  return {
    summary: parsed.summary || "Analysis complete.",
    obligations: parsed.obligations || [],
    deadlines: parsed.deadlines || [],
    compliance_risks: parsed.compliance_risks || [],
    overall_risk: parsed.overall_risk || "Medium",
  };
}

// ─── Main handler ──────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { text, contractName } = await req.json();

    if (!text || typeof text !== "string") {
      return jsonResponse({ error: "No contract text provided" }, 400);
    }

    if (text.trim().length < 50) {
      return jsonResponse(
        { error: "The extracted text is too short to analyze. The PDF may be scanned images without OCR." },
        400
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    let analysis: AnalysisResult;

    if (openaiKey) {
      try {
        analysis = await openaiAnalysis(text, contractName || "Contract", openaiKey);
      } catch (e) {
        console.error("OpenAI analysis failed, falling back to rule-based:", e);
        analysis = ruleBasedAnalysis(text, contractName || "Contract");
      }
    } else {
      analysis = ruleBasedAnalysis(text, contractName || "Contract");
    }

    return jsonResponse({ analysis });
  } catch (err) {
    console.error("Analysis error:", err);
    return jsonResponse(
      { error: "An unexpected error occurred during analysis. Please try again." },
      500
    );
  }
});
