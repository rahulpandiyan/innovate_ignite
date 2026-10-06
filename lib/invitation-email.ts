// Invitation email for college outreach. Table-based, inline-styled HTML that
// renders in Outlook/Gmail (PNG assets only — Outlook cannot decode WebP).
import { sendEmail } from "@/lib/email";
import {
  eventCategories,
  type EventCategory,
} from "@/data/eventCategories";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.innovateignite.tech";
const SITE_URL = BASE_URL.replace(/\/$/, "");
const ASSET = (file: string) => `${SITE_URL}/images/brand/${file}`;
const BROCHURE_URL = `${SITE_URL}/brochure/innovate-ignite-26-brochure.pdf`;

// Brand tokens mirrored from app/globals.css
const INK = "#1F2430";
const BODY = "#5B6472";
const MUTED = "#98A2B3";
const BLUE = "#2362EC";
const NAVY = "#1A3A8B";
const GOLD = "#F3C317";
const HAIRLINE = "#E7EAF0";
const SOFT = "#F5F7FB";

type DomainMeta = { label: string; color: string };

const DOMAIN_META: Record<string, DomainMeta> = {
  TECHNICAL: { label: "Technical", color: "#2362EC" },
  GAMING: { label: "Gaming", color: "#B45309" },
  DANCE: { label: "Dance", color: "#BE185D" },
  THEATRE: { label: "Theatre", color: "#0F766E" },
  GENERAL: { label: "General", color: "#1A3A8B" },
};

const DOMAIN_ORDER = ["TECHNICAL", "GAMING", "DANCE", "THEATRE", "GENERAL"];

// Short marketing copy, keyed by event slug so names/prices stay sourced from
// data/eventCategories.ts rather than duplicated here.
const BLURBS: Record<string, string> = {
  "techninja-quiz": "Three rounds of general technical trivia. Judging is on merit and AI tools are strictly off the table.",
  "code-conflux": "Debugging, coding and problem-solving rounds for first- to fourth-year students across every branch.",
  "project-expo": "Hardware, software or hybrid projects on display, judged on innovation and technical implementation.",
  "bgmi-freefire": "Offline campus squad showdown for four-player teams, with a prize pool of up to ₹5,000.",
  "vvit-got-latent": "An open stage for any talent — sing, dance, act, improvise. About 150 seconds to make it count.",
  "danceexe": "Any dance style, solo or as a group of up to twelve. Let the floor decide the act.",
  "crucial-beats": "Solo or group singing in any language or genre, with live vocals and a four-minute set.",
  "air-crash": "Debate the life of a real historical figure. Pre-registering your persona is compulsory.",
  "group-discussion": "Speak for or against the topic. Five minutes to prepare, and every member is expected to speak.",
  "vv-care": "Interview local vendors on camera, then analyse their problems and present workable solutions.",
  "reel-video-making": "Theme assigned on the spot and shot on the day. Created entirely by hand — no AI tools.",
  "pixels-photography": "A campus photo walk judged on creativity. Basic editing only, and no composites.",
  "the-royal-walk": "Walk the ramp as an Indian historical or mythological figure, in appropriate attire.",
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function feeLabel(event: EventCategory): string {
  if (event.price <= 0) return "Free";
  switch (event.priceMode) {
    case "PER_TEAM":
      return `₹${event.price} / team`;
    case "PER_PARTICIPANT":
      return `₹${event.price} / head`;
    case "SOLO_OR_GROUP":
      return event.groupPrice
        ? `₹${event.price} solo · ₹${event.groupPrice} group`
        : `₹${event.price}`;
    default:
      return "";
  }
}

function sizeLabel(event: EventCategory): string {
  const { minTeamSize: min, maxTeamSize: max } = event;
  if (min === 1 && max === 1) return "Solo entry";
  if (min === max) return `Teams of ${min}`;
  return `${min}–${max} members`;
}

function blurbFor(event: EventCategory): string {
  const blurb = BLURBS[event.slug];
  if (!blurb) {
    console.warn(
      `[invitation-email] missing blurb for "${event.slug}" (${event.eventName}); add one to BLURBS in lib/invitation-email.ts`
    );
    return "";
  }
  return blurb;
}

function eventRow(event: EventCategory): string {
  const href = `${SITE_URL}/events/${event.slug}`;
  return `
            <tr>
              <td style="padding:13px 0;border-bottom:1px solid ${HAIRLINE};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font:600 15px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};padding-right:14px;">
                      <a href="${href}" target="_blank" style="color:${INK};text-decoration:none;">${esc(
                        event.eventName
                      )}</a>
                    </td>
                    <td align="right" valign="top" style="white-space:nowrap;font:600 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${NAVY};background:${SOFT};border:1px solid ${HAIRLINE};border-radius:999px;padding:5px 11px;">
                      ${esc(feeLabel(event))}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top:6px;font:400 13px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BODY};">
                      ${esc(blurbFor(event))}
                      <span style="color:${MUTED};">&nbsp;·&nbsp;${esc(sizeLabel(event))}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

function domainBlock(label: string, color: string, events: EventCategory[]): string {
  return `
          <tr>
            <td style="padding:26px 0 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="10" height="10" bgcolor="${color}" style="width:10px;height:10px;line-height:10px;font-size:0;">&nbsp;</td>
                  <td style="padding-left:10px;font:700 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:0.14em;text-transform:uppercase;color:${color};">
                    ${esc(label)}
                  </td>
                  <td style="padding-left:8px;font:500 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${MUTED};">
                    ${events.length} ${events.length === 1 ? "event" : "events"}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${events.map(eventRow).join("")}`;
}

function primaryButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;">
            <tr><td bgcolor="${BLUE}" style="border-radius:10px;">
              <a href="${href}" target="_blank" style="display:inline-block;padding:14px 30px;font:600 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:10px;">${esc(
                label
              )}</a>
            </td></tr>
          </table>`;
}

function ghostButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;">
            <tr><td bgcolor="#ffffff" style="border:1px solid ${HAIRLINE};border-radius:10px;">
              <a href="${href}" target="_blank" style="display:inline-block;padding:13px 26px;font:600 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};text-decoration:none;border-radius:10px;">${esc(
                label
              )}</a>
            </td></tr>
          </table>`;
}

export interface InvitationContentOptions {
  collegeName?: string;
  recipientName?: string;
}

export interface InvitationEmailOptions extends InvitationContentOptions {
  to: string;
}

export function buildInvitationHtml(
  options: InvitationContentOptions = {}
): string {
  const salutation = options.recipientName
    ? `Dear ${esc(options.recipientName)},`
    : "Dear Sir / Madam,";
  const intro = options.collegeName
    ? `Greetings from the Department of Computer Science &amp; Engineering, VVIT. We would be glad to have <strong>${esc(
        options.collegeName
      )}</strong> join us for two days of student-built competitions across technical, gaming, performance and creative domains.`
    : "Greetings from the Department of Computer Science &amp; Engineering, VVIT. We would be glad to have your students join us for two days of student-built competitions across technical, gaming, performance and creative domains.";

  const grouped = DOMAIN_ORDER.map((domain) => ({
    meta: DOMAIN_META[domain] ?? { label: domain, color: BLUE },
    events: eventCategories.filter((event) => event.category === domain),
  })).filter((group) => group.events.length > 0);

  const domainBlocks = grouped
    .map((group) => domainBlock(group.meta.label, group.meta.color, group.events))
    .join("");

  const totalEvents = eventCategories.length;
  const totalDomains = grouped.length;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Innovate Ignite '26 — Invitation from VVIT</title>
<style>
  html,body{margin:0!important;padding:0!important;width:100%!important;background:${SOFT}}
  *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}
  table{border-spacing:0;border-collapse:collapse}
  td{padding:0}
  img{border:0;display:block;outline:none;text-decoration:none}
  a{text-decoration:none}
  @media(max-width:620px){
    .wrap{width:100%!important}
    .gut{padding-left:22px!important;padding-right:22px!important}
    .h1{font-size:29px!important;line-height:35px!important}
    .lead{font-size:15px!important}
    .stack,.stack tr,.stack td{display:block!important;width:100%!important}
    .stack td{border-left:0!important;border-top:1px solid ${HAIRLINE}!important;padding:14px 0!important}
    .stack td:first-child{border-top:0!important}
    .cta,.cta a{display:block!important;text-align:center!important}
    .cta td{padding:0 0 10px!important}
    .hide-sm{display:none!important}
  }
</style>
</head>
<body>
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${SOFT};">
  Invitation to Innovate Ignite '26 — ${totalEvents} events across ${totalDomains} domains, 13–14 October 2026 at VVIT Bengaluru. Register your college.
</div>
<center style="width:100%;background:${SOFT};padding:36px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" class="gut" style="padding:0 20px;">

<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid ${HAIRLINE};border-radius:18px;overflow:hidden;">

  <tr><td style="height:4px;line-height:4px;font-size:0;background:${NAVY};">&nbsp;</td></tr>
  <tr><td style="height:3px;line-height:3px;font-size:0;background:${GOLD};">&nbsp;</td></tr>

  <!-- Masthead -->
  <tr><td class="gut" style="padding:28px 44px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle">
        <img src="${esc(ASSET("logo-innovate-ignite.png"))}" width="132" alt="Innovate Ignite '26" style="width:132px;max-width:132px;height:auto;">
      </td>
      <td align="right" valign="middle" class="hide-sm">
        <span style="display:inline-block;font:600 11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:0.1em;color:${NAVY};background:${SOFT};border:1px solid ${HAIRLINE};border-radius:999px;padding:8px 14px;">13—14 OCT 2026</span>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="height:1px;line-height:1px;font-size:0;background:${HAIRLINE};">&nbsp;</td></tr>

  <!-- Hero -->
  <tr><td class="gut" style="padding:34px 44px 0;">
    <div style="font:700 11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:0.18em;text-transform:uppercase;color:${BLUE};">Invitation</div>
    <h1 class="h1" style="margin:14px 0 0;font:600 36px/1.15 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:-0.025em;color:${INK};">Innovate Ignite '26</h1>
    <p class="lead" style="margin:12px 0 0;font:400 16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BODY};">
      A national-level intercollegiate technical &amp; cultural fest, built and run by the students of VVIT.
    </p>
  </td></tr>

  <tr><td class="gut" style="padding:26px 44px 0;">
    <img src="${esc(ASSET("banner-fest.png"))}" width="480" alt="Innovate Ignite '26 — National Level Intercollegiate Technical &amp; Cultural Fest, Dept. of CSE, VVIT" style="width:100%;max-width:480px;height:auto;border:1px solid ${HAIRLINE};border-radius:14px;">
  </td></tr>

  <!-- Letter -->
  <tr><td class="gut" style="padding:28px 44px 0;">
    <p style="margin:0;font:400 15px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">${salutation}</p>
    <p style="margin:14px 0 0;font:400 15px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BODY};">${intro}</p>
  </td></tr>

  <!-- Facts -->
  <tr><td class="gut" style="padding:26px 44px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${HAIRLINE};border-radius:14px;background:${SOFT};">
      <tr>
        <td class="stack" width="34%" valign="top" style="padding:18px 20px;border-right:1px solid ${HAIRLINE};">
          <div style="font:700 10px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">Dates</div>
          <div style="margin-top:8px;font:600 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">Tue &amp; Wed<br>13–14 Oct 2026</div>
        </td>
        <td class="stack" width="40%" valign="top" style="padding:18px 20px;border-right:1px solid ${HAIRLINE};">
          <div style="font:700 10px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">Venue</div>
          <div style="margin-top:8px;font:600 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">VVIT Campus</div>
          <div style="margin-top:4px;font:400 12px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BODY};">35/1, Kothanur Post, Hennur-Bagalur Road, Bengaluru 560077</div>
        </td>
        <td class="stack" width="26%" valign="top" style="padding:18px 20px;">
          <div style="font:700 10px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">Edition</div>
          <div style="margin-top:8px;font:600 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">${totalEvents} events<br>${totalDomains} domains</div>
        </td>
      </tr>
      <tr>
        <td colspan="3" style="padding:13px 20px;border-top:1px solid ${HAIRLINE};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font:500 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BODY};">Two days on campus, student-organised end to end.</td>
            <td align="right" style="white-space:nowrap;">
              <a href="https://www.google.com/maps/search/?api=1&amp;query=Vijaya+Vittala+Institute+of+Technology,+Kothanur+Post,+Hennur-Bagalur+Road,+Bengaluru+560077" target="_blank" style="font:600 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BLUE};text-decoration:none;">Directions &rarr;</a>
            </td>
          </tr></table>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Events -->
  <tr><td class="gut" style="padding:34px 44px 0;">
    <div style="font:700 11px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:0.18em;text-transform:uppercase;color:${BLUE};">Line-up</div>
    <h2 style="margin:14px 0 0;font:600 23px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:-0.02em;color:${INK};">${totalEvents} events. ${totalDomains} domains. One fest.</h2>
    <p style="margin:10px 0 0;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BODY};">
      Pick your events at registration — teams can enter more than one. Fees are listed per event below.
    </p>
  </td></tr>
  <tr><td class="gut" style="padding:6px 44px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${domainBlocks}
      <tr><td style="padding:18px 0 0;font:500 13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${MUTED};">
        <a href="${SITE_URL}/events" target="_blank" style="color:${BLUE};text-decoration:none;font-weight:600;">See full rules, venues and coordinators &rarr;</a>
      </td></tr>
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td class="gut" style="padding:32px 44px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="cta"><tr>
      <td align="left" class="cta" style="padding-right:10px;">${primaryButton(`${SITE_URL}/`, "Register your college")}</td>
      <td align="right" class="cta">${ghostButton(BROCHURE_URL, "Download brochure (PDF)")}</td>
    </tr></table>
  </td></tr>

  <!-- Closing -->
  <tr><td class="gut" style="padding:30px 44px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${HAIRLINE};border-radius:14px;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0;font:400 14px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BODY};">
          For queries, write to
          <a href="mailto:hello@innovateignite.tech" style="color:${INK};font-weight:600;text-decoration:none;">hello@innovateignite.tech</a>,
          or reach the student coordinators for a specific event through the portal.
        </p>
        <p style="margin:16px 0 0;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
          Warm regards,<br>
          <span style="font-weight:600;">Dept. of CSE</span><br>
          <span style="color:${BODY};">Vijaya Vittala Institute of Technology</span>
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="height:1px;line-height:1px;font-size:0;background:${HAIRLINE};">&nbsp;</td></tr>

  <!-- Footer -->
  <tr><td class="gut" style="padding:24px 44px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="top">
        <img src="${esc(ASSET("logo-vvit.png"))}" width="164" alt="Vijaya Vittala Institute of Technology" style="width:164px;max-width:164px;height:auto;">
      </td>
      <td align="right" valign="top" style="white-space:nowrap;font:500 12px/1.9 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <a href="${SITE_URL}/" target="_blank" style="color:${INK};font-weight:600;text-decoration:none;">innovateignite.tech</a><br>
        <a href="https://www.instagram.com/innovateignite/" target="_blank" style="color:${BODY};text-decoration:none;">@innovateignite</a>
      </td>
    </tr></table>
    <p style="margin:20px 0 0;font:400 11px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${MUTED};">
      You received this invitation from the Department of Computer Science &amp; Engineering, VVIT Bengaluru.
    </p>
  </td></tr>

</table>
</td></tr></table>
</center>
</body>
</html>`;
}

export async function sendInvitationEmail(
  options: InvitationEmailOptions
): Promise<{ id: string; status: string }> {
  return sendEmail({
    to: options.to,
    subject: "Innovate Ignite '26 — Invitation from VVIT",
    html: buildInvitationHtml(options),
  });
}
