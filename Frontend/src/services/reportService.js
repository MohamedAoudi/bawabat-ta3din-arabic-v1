// Report service for communicating with the FastAPI report API (PDF generation).
// Mirrors chatbotService.js. The report API runs on :8001 (chatbot is on :8000).
const REPORT_API_URL = (
  import.meta.env.VITE_REPORT_API_URL || "http://localhost:8001"
).replace(/\/$/, "");

// ISO code -> exact official English country name the report API matches on
// (public.countries.name_en). These MUST match GET /options?lang=en byte-for-byte.
export const REPORT_COUNTRY_NAMES = {
  jo: "Hashemite Kingdom of Jordan",
  ae: "United Arab Emirates",
  bh: "Kingdom of Bahrain",
  tn: "Republic of Tunisia",
  dz: "People's Democratic Republic of Algeria",
  dj: "Republic of Djibouti",
  sa: "Kingdom of Saudi Arabia",
  sd: "Republic of the Sudan",
  sy: "Syrian Arab Republic",
  so: "Federal Republic of Somalia",
  iq: "Republic of Iraq",
  om: "Sultanate of Oman",
  ps: "State of Palestine",
  qa: "State of Qatar",
  kw: "State of Kuwait",
  lb: "Lebanese Republic",
  ly: "State of Libya",
  eg: "Arab Republic of Egypt",
  ma: "Kingdom of Morocco",
  mr: "Islamic Republic of Mauritania",
  ye: "Republic of Yemen",
};

// API hard-limits year_from/year_to to this inclusive range (ReportParams in api.py).
export const REPORT_YEAR_MIN = 2010;
export const REPORT_YEAR_MAX = 2024;

/** Pull the attachment filename out of a Content-Disposition header. */
function parseFilename(contentDisposition) {
  if (!contentDisposition) return null;
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(
    contentDisposition
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** FastAPI `detail` can be a string or a 422 validation array — normalize to text. */
function formatDetail(detail) {
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
  }
  return String(detail);
}

export const reportService = {
  /**
   * Generate a PDF report.
   * @param {{country:string, mineral:string, year_from:number, year_to:number, lang:string}} params
   * @param {{signal?: AbortSignal}} options
   * @returns {Promise<{ok:true, blob:Blob, filename:string} | {ok:false, status:number, detail:string, aborted?:boolean}>}
   */
  async generateReport(params, { signal } = {}) {
    try {
      const response = await fetch(`${REPORT_API_URL}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal,
      });

      if (response.ok) {
        const blob = await response.blob();
        const filename =
          parseFilename(response.headers.get("Content-Disposition")) ||
          "amip-report.pdf";
        return { ok: true, blob, filename };
      }

      // Error path: body is JSON { detail: ... }
      let detail = response.statusText;
      try {
        const data = await response.json();
        detail = formatDetail(data.detail) || detail;
      } catch {
        /* non-JSON error body — keep statusText */
      }
      return { ok: false, status: response.status, detail };
    } catch (error) {
      if (error.name === "AbortError") {
        return { ok: false, status: 0, detail: "aborted", aborted: true };
      }
      return { ok: false, status: 0, detail: error.message || "Network error" };
    }
  },

  /**
   * List available countries/minerals from the DB (drives availability hints).
   * @returns {Promise<{countries:string[], minerals:string[]} | null>}
   */
  async getOptions(lang = "en") {
    try {
      const response = await fetch(
        `${REPORT_API_URL}/options?lang=${encodeURIComponent(lang)}`
      );
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  /**
   * Only the (country, mineral) combinations that yield a non-empty report,
   * each with its inclusive [year_min, year_max] data span. Keys are official
   * English country names and English mineral names (match /report params).
   * @returns {Promise<{pairs:Object<string,Object<string,[number,number]>>, year_min:number, year_max:number} | null>}
   */
  async getAvailability() {
    try {
      const response = await fetch(`${REPORT_API_URL}/availability`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },
};
