/**
 * Weekly Analytics Report for La Maille
 * Pulls GA4 + Supabase data, sends email report via Brevo
 * Run: npx tsx scripts/weekly-analytics.ts
 * Schedule: every Monday 8:00 AM
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { createClient } from "@supabase/supabase-js"
import path from "path"

// Config
const GA_PROPERTY = "properties/525258991"
const GA_KEY_FILE = path.join(__dirname, "../ga-service-account.json")
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
const BREVO_API_KEY = process.env.BREVO_API_KEY || ""
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const ADMIN_EMAIL = "jzakoian@gmail.com"

// Trafic bot identifie en aout 2026 : ~20 % des sessions venaient de Chine
// et Singapour en "direct", engagement 2-10 %, duree 1-6 s, sur les articles
// de blog EN. Exclu de toutes les metriques du rapport ; le volume exclu est
// affiche a part pour garder la trace.
const BOT_COUNTRIES = ["China", "Singapore"]
const BOT_COUNTRY_FILTER = {
  notExpression: {
    filter: {
      fieldName: "country",
      inListFilter: { values: BOT_COUNTRIES },
    },
  },
}
const BREVO_LIST_NAME = "la-maille-audience"

// GA4 client
const ga = new BetaAnalyticsDataClient({ keyFilename: GA_KEY_FILE })

// Supabase client
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

// Helpers
function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function pct(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%"
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? "+" : ""
  return `${sign}${change.toFixed(0)}%`
}

// GA4 data
async function getGAMetrics(startDate: string, endDate: string) {
  const [response] = await ga.runReport({
    property: GA_PROPERTY,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
      { name: "newUsers" },
    ],
    dimensionFilter: BOT_COUNTRY_FILTER,
  })

  const values = response.rows?.[0]?.metricValues || []
  return {
    activeUsers: parseInt(values[0]?.value || "0"),
    sessions: parseInt(values[1]?.value || "0"),
    pageViews: parseInt(values[2]?.value || "0"),
    avgSessionDuration: parseFloat(values[3]?.value || "0"),
    bounceRate: parseFloat(values[4]?.value || "0"),
    newUsers: parseInt(values[5]?.value || "0"),
  }
}

async function getTopPages(startDate: string, endDate: string) {
  const [response] = await ga.runReport({
    property: GA_PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 10,
    dimensionFilter: BOT_COUNTRY_FILTER,
  })

  return (response.rows || []).map((row) => ({
    page: row.dimensionValues?.[0]?.value || "",
    views: parseInt(row.metricValues?.[0]?.value || "0"),
  }))
}

async function getTopSources(startDate: string, endDate: string) {
  const [response] = await ga.runReport({
    property: GA_PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 8,
    dimensionFilter: BOT_COUNTRY_FILTER,
  })

  return (response.rows || []).map((row) => ({
    source: row.dimensionValues?.[0]?.value || "(direct)",
    sessions: parseInt(row.metricValues?.[0]?.value || "0"),
  }))
}

async function getTopCountries(startDate: string, endDate: string) {
  const [response] = await ga.runReport({
    property: GA_PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 5,
    dimensionFilter: BOT_COUNTRY_FILTER,
  })

  return (response.rows || []).map((row) => ({
    country: row.dimensionValues?.[0]?.value || "",
    users: parseInt(row.metricValues?.[0]?.value || "0"),
  }))
}

async function getFunnelEvents(startDate: string, endDate: string) {
  const eventNames = ["form_start", "select_size", "generate_pattern", "sign_up", "save_pattern"]

  const [response] = await ga.runReport({
    property: GA_PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: {
      andGroup: {
        expressions: [
          { filter: { fieldName: "eventName", inListFilter: { values: eventNames } } },
          BOT_COUNTRY_FILTER,
        ],
      },
    },
  })

  const events: Record<string, { count: number; users: number }> = {}
  for (const name of eventNames) {
    events[name] = { count: 0, users: 0 }
  }

  for (const row of response.rows || []) {
    const name = row.dimensionValues?.[0]?.value || ""
    if (events[name] !== undefined) {
      events[name] = {
        count: parseInt(row.metricValues?.[0]?.value || "0"),
        users: parseInt(row.metricValues?.[1]?.value || "0"),
      }
    }
  }

  return events
}

// Sessions exclues comme bot (pour afficher ce qu'on ne compte pas)
async function getExcludedBotSessions(startDate: string, endDate: string) {
  const [response] = await ga.runReport({
    property: GA_PROPERTY,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: "sessions" }],
    dimensionFilter: {
      filter: { fieldName: "country", inListFilter: { values: BOT_COUNTRIES } },
    },
  })
  return parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0")
}

// Canal assistants IA (ChatGPT, Perplexity, Claude, Gemini) : 3e canal et
// meilleur taux de generation mesure en aout 2026. Suivi a part.
async function getAiAssistantSessions(startDate: string, endDate: string) {
  const [response] = await ga.runReport({
    property: GA_PROPERTY,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionSource" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    dimensionFilter: {
      filter: { fieldName: "sessionMedium", stringFilter: { value: "ai-assistant" } },
    },
    limit: 6,
  })
  const rows = (response.rows || []).map((row) => ({
    source: row.dimensionValues?.[0]?.value || "",
    sessions: parseInt(row.metricValues?.[0]?.value || "0"),
  }))
  return { total: rows.reduce((sum, r) => sum + r.sessions, 0), rows }
}

// Contacts Brevo captures par la gate email (BRIEF-01). null si cle absente
// ou liste introuvable : on affiche "n/d" plutot qu'un zero trompeur.
async function getBrevoAudienceCount(): Promise<number | null> {
  if (!BREVO_API_KEY) return null
  try {
    const res = await fetch("https://api.brevo.com/v3/contacts/lists?limit=50", {
      headers: { "api-key": BREVO_API_KEY },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { lists?: Array<{ name: string; totalSubscribers: number }> }
    const list = (data.lists || []).find((l) => l.name === BREVO_LIST_NAME)
    return list ? list.totalSubscribers : null
  } catch {
    return null
  }
}

// Supabase data
async function getSupabaseMetrics(since: Date) {
  if (!supabase) return null

  const sinceISO = since.toISOString()
  // Cohort: users who signed up 7-14 days before `since` (i.e. one week before the reporting week)
  const cohortStart = new Date(since.getTime() - 7 * 24 * 3600 * 1000).toISOString()
  const cohortEnd = sinceISO

  const [profiles, patterns] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sinceISO),
    supabase.from("saved_patterns").select("id", { count: "exact", head: true }).gte("created_at", sinceISO),
  ])

  const [totalProfiles, totalPatterns] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("saved_patterns").select("id", { count: "exact", head: true }),
  ])

  // Top garment types this week
  const { data: garmentData } = await supabase
    .from("saved_patterns")
    .select("garment_type")
    .gte("created_at", sinceISO)

  const garmentCounts: Record<string, number> = {}
  for (const row of garmentData || []) {
    const type = row.garment_type || "unknown"
    garmentCounts[type] = (garmentCounts[type] || 0) + 1
  }

  // Cohort retention: of users who signed up 7-14d ago, how many saved a pattern this week?
  const { data: cohortRows } = await supabase
    .from("profiles")
    .select("id")
    .gte("created_at", cohortStart)
    .lt("created_at", cohortEnd)

  const cohortIds = (cohortRows || []).map((r) => r.id)
  let cohortReturners = 0
  if (cohortIds.length > 0) {
    const { data: returnerRows } = await supabase
      .from("saved_patterns")
      .select("user_id")
      .gte("created_at", sinceISO)
      .in("user_id", cohortIds)
    cohortReturners = new Set((returnerRows || []).map((r) => r.user_id)).size
  }

  return {
    newUsers: profiles.count || 0,
    newPatterns: patterns.count || 0,
    totalUsers: totalProfiles.count || 0,
    totalPatterns: totalPatterns.count || 0,
    garmentCounts,
    cohortSize: cohortIds.length,
    cohortReturners,
    retentionRate: cohortIds.length > 0 ? (cohortReturners / cohortIds.length) * 100 : 0,
  }
}

// Email
async function sendReport(html: string, subject: string) {
  if (!BREVO_API_KEY) {
    console.log("BREVO_API_KEY not set, printing to console instead")
    console.log(subject)
    console.log(html.replace(/<[^>]*>/g, ""))
    return
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "La Maille Analytics", email: "contact@la-maille.com" },
      to: [{ email: ADMIN_EMAIL, name: "Julien" }],
      subject,
      htmlContent: html,
    }),
  })

  if (!res.ok) {
    throw new Error(`Brevo error: ${res.status} ${await res.text()}`)
  }
  console.log("Report sent to", ADMIN_EMAIL)
}

// Build report
function buildReport(data: {
  week: typeof metrics
  prevWeek: typeof metrics
  month: typeof metrics
  topPages: Awaited<ReturnType<typeof getTopPages>>
  topSources: Awaited<ReturnType<typeof getTopSources>>
  topCountries: Awaited<ReturnType<typeof getTopCountries>>
  funnelWeek: Awaited<ReturnType<typeof getFunnelEvents>>
  funnelMonth: Awaited<ReturnType<typeof getFunnelEvents>>
  supabase: Awaited<ReturnType<typeof getSupabaseMetrics>>
  aiWeek: Awaited<ReturnType<typeof getAiAssistantSessions>>
  aiMonth: Awaited<ReturnType<typeof getAiAssistantSessions>>
  botSessionsWeek: number
  brevoAudience: number | null
  dateRange: { weekStart: string; weekEnd: string }
}) {
  const { week, prevWeek, month, topPages, topSources, topCountries, funnelWeek, funnelMonth, supabase: sb, aiWeek, aiMonth, botSessionsWeek, brevoAudience, dateRange } = data

  const metricRow = (label: string, weekVal: number, prevVal: number, monthVal: number, format?: "duration" | "percent") => {
    let wStr = String(weekVal)
    let mStr = String(monthVal)
    if (format === "duration") {
      wStr = `${Math.floor(weekVal / 60)}m${Math.floor(weekVal % 60)}s`
      mStr = `${Math.floor(monthVal / 60)}m${Math.floor(monthVal % 60)}s`
    } else if (format === "percent") {
      wStr = `${(weekVal * 100).toFixed(1)}%`
      mStr = `${(monthVal * 100).toFixed(1)}%`
    }
    const change = format === "percent" || format === "duration"
      ? ""
      : `<span style="color:${weekVal >= prevVal ? "#4ade80" : "#f87171"};font-size:11px;"> ${pct(weekVal, prevVal)}</span>`

    return `<tr>
      <td style="padding:6px 0;color:#aaa;font-size:13px;">${label}</td>
      <td style="padding:6px 12px;font-size:14px;font-weight:bold;text-align:right;">${wStr}${change}</td>
      <td style="padding:6px 0;font-size:13px;text-align:right;color:#888;">${mStr}</td>
    </tr>`
  }

  const pageRows = topPages.map((p) =>
    `<tr><td style="padding:3px 12px 3px 0;font-size:12px;color:#ddd;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.page}</td><td style="padding:3px 0;font-size:12px;text-align:right;">${p.views}</td></tr>`
  ).join("")

  const sourceRows = topSources.map((s) =>
    `<tr><td style="padding:3px 12px 3px 0;font-size:12px;color:#ddd;">${s.source}</td><td style="padding:3px 0;font-size:12px;text-align:right;">${s.sessions}</td></tr>`
  ).join("")

  const countryRows = topCountries.map((c) =>
    `<tr><td style="padding:3px 12px 3px 0;font-size:12px;color:#ddd;">${c.country}</td><td style="padding:3px 0;font-size:12px;text-align:right;">${c.users}</td></tr>`
  ).join("")

  const aiRows = aiWeek.rows.map((r) =>
    `<tr><td style="padding:2px 0 2px 16px;color:#888;font-size:12px;">${r.source}</td><td style="padding:2px 12px;font-size:12px;text-align:right;" colspan="2">${r.sessions}</td></tr>`
  ).join("")

  const supabaseSection = sb ? `
    <tr><td colspan="3" style="padding:16px 0 8px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Produit</td></tr>
    <tr><td style="padding:4px 0;color:#aaa;font-size:13px;">Nouvelles inscriptions</td><td style="padding:4px 12px;font-size:14px;font-weight:bold;text-align:right;" colspan="2">${sb.newUsers} (total: ${sb.totalUsers})</td></tr>
    <tr><td style="padding:4px 0;color:#aaa;font-size:13px;">Contacts Brevo (gate email)</td><td style="padding:4px 12px;font-size:14px;font-weight:bold;text-align:right;" colspan="2">${brevoAudience === null ? "n/d" : brevoAudience}</td></tr>
    <tr><td style="padding:4px 0;color:#aaa;font-size:13px;">Patrons sauvegardés</td><td style="padding:4px 12px;font-size:14px;font-weight:bold;text-align:right;" colspan="2">${sb.newPatterns} (total: ${sb.totalPatterns})</td></tr>
    ${Object.entries(sb.garmentCounts || {}).length > 0 ? Object.entries(sb.garmentCounts).map(([type, count]) =>
      `<tr><td style="padding:2px 0 2px 16px;color:#888;font-size:12px;">${type}</td><td style="padding:2px 12px;font-size:12px;text-align:right;" colspan="2">${count}</td></tr>`
    ).join("") : ""}
    <tr><td style="padding:4px 0;color:#aaa;font-size:13px;">Rétention cohorte (J-14 → J-7)</td><td style="padding:4px 12px;font-size:14px;font-weight:bold;text-align:right;" colspan="2">${sb.cohortReturners}/${sb.cohortSize} (${sb.retentionRate.toFixed(0)}%)</td></tr>
    <tr><td style="padding:0 0 8px 16px;color:#666;font-size:11px;font-style:italic;" colspan="3">Inscrits semaine dernière qui ont sauvegardé un patron cette semaine</td></tr>
  ` : ""

  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#0C1A14;font-family:monospace;color:#F0EBE0;">
<p style="color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">La Maille</p>
<h1 style="margin:0 0 4px;font-size:20px;font-weight:normal;">Rapport hebdomadaire</h1>
<p style="color:#888;font-size:12px;margin-bottom:24px;">${dateRange.weekStart} au ${dateRange.weekEnd}</p>

<table style="border-collapse:collapse;width:100%;max-width:500px;">
  <tr>
    <td></td>
    <td style="padding:4px 12px;font-size:11px;color:#888;text-align:right;">7 jours</td>
    <td style="padding:4px 0;font-size:11px;color:#888;text-align:right;">30 jours</td>
  </tr>
  <tr><td colspan="3" style="padding:12px 0 8px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Traffic</td></tr>
  ${metricRow("Utilisateurs actifs", week.activeUsers, prevWeek.activeUsers, month.activeUsers)}
  ${metricRow("Nouveaux utilisateurs", week.newUsers, prevWeek.newUsers, month.newUsers)}
  ${metricRow("Sessions", week.sessions, prevWeek.sessions, month.sessions)}
  ${metricRow("Pages vues", week.pageViews, prevWeek.pageViews, month.pageViews)}
  <tr><td style="padding:0 0 8px 16px;color:#666;font-size:11px;font-style:italic;" colspan="3">Hors trafic bot (${BOT_COUNTRIES.join(", ")}) : ${botSessionsWeek} sessions exclues cette semaine</td></tr>
  <tr><td colspan="3" style="padding:12px 0 8px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Assistants IA</td></tr>
  ${metricRow("Sessions via ChatGPT & co", aiWeek.total, 0, aiMonth.total)}
  ${aiRows}
  <tr><td colspan="3" style="padding:12px 0 8px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Engagement</td></tr>
  ${metricRow("Durée moyenne session", week.avgSessionDuration, prevWeek.avgSessionDuration, month.avgSessionDuration, "duration")}
  ${metricRow("Taux de rebond", week.bounceRate, prevWeek.bounceRate, month.bounceRate, "percent")}
  <tr><td colspan="3" style="padding:12px 0 8px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Revisite</td></tr>
  ${metricRow("Utilisateurs récurrents", Math.max(week.activeUsers - week.newUsers, 0), Math.max(prevWeek.activeUsers - prevWeek.newUsers, 0), Math.max(month.activeUsers - month.newUsers, 0))}
  <tr><td style="padding:6px 0;color:#aaa;font-size:13px;">Part de récurrents</td><td style="padding:6px 12px;font-size:14px;font-weight:bold;text-align:right;">${week.activeUsers > 0 ? (((week.activeUsers - week.newUsers) / week.activeUsers) * 100).toFixed(1) : 0}%</td><td style="padding:6px 0;font-size:13px;text-align:right;color:#888;">${month.activeUsers > 0 ? (((month.activeUsers - month.newUsers) / month.activeUsers) * 100).toFixed(1) : 0}%</td></tr>
  <tr><td style="padding:6px 0;color:#aaa;font-size:13px;">Sessions / utilisateur</td><td style="padding:6px 12px;font-size:14px;font-weight:bold;text-align:right;">${week.activeUsers > 0 ? (week.sessions / week.activeUsers).toFixed(2) : 0}</td><td style="padding:6px 0;font-size:13px;text-align:right;color:#888;">${month.activeUsers > 0 ? (month.sessions / month.activeUsers).toFixed(2) : 0}</td></tr>
  <tr><td colspan="3" style="padding:12px 0 8px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Funnel produit</td></tr>
  ${metricRow("Formulaire commencé", funnelWeek.form_start.count, 0, funnelMonth.form_start.count)}
  ${metricRow("Taille sélectionnée", funnelWeek.select_size.count, 0, funnelMonth.select_size.count)}
  ${metricRow("Patron généré", funnelWeek.generate_pattern.count, 0, funnelMonth.generate_pattern.count)}
  ${metricRow("Inscription", funnelWeek.sign_up.count, 0, funnelMonth.sign_up.count)}
  ${metricRow("Patron sauvegardé", funnelWeek.save_pattern.count, 0, funnelMonth.save_pattern.count)}
  <tr><td style="padding:6px 0;color:#aaa;font-size:13px;">Taux de conversion visiteur → patron</td><td style="padding:6px 12px;font-size:14px;font-weight:bold;text-align:right;" colspan="2">${week.activeUsers > 0 ? ((funnelWeek.generate_pattern.count / week.activeUsers) * 100).toFixed(1) : 0}%</td></tr>
  ${supabaseSection}
</table>

<table style="border-collapse:collapse;width:100%;max-width:500px;margin-top:24px;">
  <tr><td colspan="2" style="padding:12px 0 8px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Top pages (7j)</td></tr>
  ${pageRows}
</table>

<table style="border-collapse:collapse;width:100%;max-width:500px;margin-top:24px;">
  <tr><td colspan="2" style="padding:12px 0 8px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Sources (7j)</td></tr>
  ${sourceRows}
</table>

<table style="border-collapse:collapse;width:100%;max-width:500px;margin-top:24px;">
  <tr><td colspan="2" style="padding:12px 0 8px;color:#C9A84C;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Pays (7j)</td></tr>
  ${countryRows}
</table>

<p style="margin-top:32px;color:#555;font-size:11px;">Rapport automatique La Maille Analytics</p>
</body></html>`
}

// Placeholder for type inference
let metrics: Awaited<ReturnType<typeof getGAMetrics>>

// Main
async function main() {
  console.log("Generating weekly analytics report...")

  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() - 1) // yesterday
  const weekStart = new Date(weekEnd)
  weekStart.setDate(weekStart.getDate() - 6) // 7 days before yesterday

  const prevWeekEnd = new Date(weekStart)
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 1)
  const prevWeekStart = new Date(prevWeekEnd)
  prevWeekStart.setDate(prevWeekStart.getDate() - 6)

  // Fetch all data in parallel
  const [week, prevWeek, month, topPages, topSources, topCountries, funnelWeek, funnelMonth, sbMetrics, aiWeek, aiMonth, botSessionsWeek, brevoAudience] = await Promise.all([
    getGAMetrics("7daysAgo", "yesterday"),
    getGAMetrics("14daysAgo", "8daysAgo"),
    getGAMetrics("30daysAgo", "yesterday"),
    getTopPages("7daysAgo", "yesterday"),
    getTopSources("7daysAgo", "yesterday"),
    getTopCountries("7daysAgo", "yesterday"),
    getFunnelEvents("7daysAgo", "yesterday"),
    getFunnelEvents("30daysAgo", "yesterday"),
    getSupabaseMetrics(weekStart),
    getAiAssistantSessions("7daysAgo", "yesterday"),
    getAiAssistantSessions("30daysAgo", "yesterday"),
    getExcludedBotSessions("7daysAgo", "yesterday"),
    getBrevoAudienceCount(),
  ])

  console.log("GA4 data:", { week, prevWeek: { activeUsers: prevWeek.activeUsers } })
  console.log("Funnel:", funnelWeek)
  if (sbMetrics) console.log("Supabase data:", sbMetrics)

  const html = buildReport({
    week,
    prevWeek,
    month,
    topPages,
    topSources,
    topCountries,
    funnelWeek,
    funnelMonth,
    supabase: sbMetrics,
    aiWeek,
    aiMonth,
    botSessionsWeek,
    brevoAudience,
    dateRange: {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
    },
  })

  const convRate = week.activeUsers > 0 ? ((funnelWeek.generate_pattern.count / week.activeUsers) * 100).toFixed(1) : "0"
  const subject = `[La Maille] ${week.activeUsers} visiteurs, ${funnelWeek.generate_pattern.count} patrons générés (${convRate}% conv.)`

  await sendReport(html, subject)
  console.log("Done.")
}

main().catch((err) => {
  console.error("Report failed:", err)
  process.exit(1)
})
