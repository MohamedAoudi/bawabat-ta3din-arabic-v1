import { useRef, useEffect, useState, useMemo } from "react";
import Chart from "chart.js/auto";

/**
 * ChatChart — renders the AMIP chatbot's deterministic `chart_data` payload.
 *
 * Principle (already enforced by the backend): the chatbot only *detects* chart
 * intent; every numeric value is built server-side from the `public` schema.
 * This component never computes or invents values — it only reshapes the rows
 * the API returns into a chart.js config and draws them in AMIP's palette.
 *
 * AMIP `chart_data` comes in two shapes, both handled here:
 *   • long / single-measure  — rows have a numeric `value`, optionally grouped
 *     by a `series` string (e.g. flow "Export"/"Import", or a mineral name).
 *   • wide / multi-measure   — no `value`; several numeric columns per row
 *     (e.g. arab_total_base + world_production_base, or the trade-summary USD
 *     columns). Each numeric column becomes its own series.
 */

// Localized labels for the known wide-format measure columns.
const MEASURE_LABELS = {
  value: { en: "Value", fr: "Valeur", ar: "القيمة" },
  arab_total_base: { en: "Arab production", fr: "Production arabe", ar: "الإنتاج العربي" },
  world_production_base: { en: "World production", fr: "Production mondiale", ar: "الإنتاج العالمي" },
  arab_share_pct: { en: "Arab share %", fr: "Part arabe %", ar: "الحصة العربية %" },
  export_value_usd: { en: "Exports", fr: "Exportations", ar: "الصادرات" },
  import_value_usd: { en: "Imports", fr: "Importations", ar: "الواردات" },
  bilateral_export_usd: { en: "Bilateral exports", fr: "Exp. bilatérales", ar: "صادرات ثنائية" },
  bilateral_import_usd: { en: "Bilateral imports", fr: "Imp. bilatérales", ar: "واردات ثنائية" },
};

// Localized labels for the category (x) axis, keyed by the API's `x_axis` hint.
const AXIS_LABELS = {
  year: { en: "Year", fr: "Année", ar: "السنة" },
  country: { en: "Country", fr: "Pays", ar: "الدولة" },
  partner: { en: "Partner", fr: "Partenaire", ar: "الشريك" },
  trade_product: { en: "Product", fr: "Produit", ar: "المنتج" },
  mineral: { en: "Mineral", fr: "Minéral", ar: "المعدن" },
  issue_type: { en: "Issue", fr: "Problème", ar: "المشكلة" },
};

const UI = {
  chart: { en: "Chart", fr: "Graphique", ar: "رسم" },
  table: { en: "Table", fr: "Tableau", ar: "جدول" },
};

const humanize = (k) =>
  String(k).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const tr = (map, key, locale, fallback) =>
  (map[key] && (map[key][locale] || map[key].en)) || fallback || humanize(key);

/** Reshape AMIP chart_data rows into { labels, datasets:[{label,data}] }. */
function buildSeries({ chartData, categoryKey, locale, chartTitle }) {
  const labels = [];
  const seenCat = new Set();
  for (const row of chartData) {
    const c = row[categoryKey];
    if (c === undefined || c === null) continue;
    if (!seenCat.has(c)) {
      seenCat.add(c);
      labels.push(c);
    }
  }

  const hasValue = chartData.some((r) => typeof r.value === "number");

  if (hasValue) {
    // Single measure, optionally split into multiple series by `series`.
    const seriesKeys = [];
    const seenS = new Set();
    for (const row of chartData) {
      const s = row.series == null ? "__single__" : String(row.series);
      if (!seenS.has(s)) {
        seenS.add(s);
        seriesKeys.push(s);
      }
    }
    const acc = {};
    seriesKeys.forEach((s) => (acc[s] = {}));
    for (const row of chartData) {
      const s = row.series == null ? "__single__" : String(row.series);
      const c = row[categoryKey];
      const v = Number(row.value);
      if (!Number.isFinite(v)) continue;
      acc[s][c] = (acc[s][c] || 0) + v; // sum on collision (e.g. trade trend across products)
    }
    const datasets = seriesKeys.map((s) => ({
      label: s === "__single__" ? chartTitle || tr(MEASURE_LABELS, "value", locale) : s,
      data: labels.map((c) => (c in acc[s] ? acc[s][c] : null)),
    }));
    return { labels, datasets };
  }

  // Wide / multi-measure: each numeric column becomes a series.
  const sample = chartData[0] || {};
  const numericCols = Object.keys(sample).filter(
    (k) =>
      k !== categoryKey &&
      k !== "year" &&
      !/rank/i.test(k) &&
      chartData.some((r) => typeof r[k] === "number")
  );
  // Percentage/share columns distort an absolute-value axis — keep them for the
  // table view but leave them out of the plotted bars/lines.
  const plotCols = numericCols.filter((k) => !/pct|share/i.test(k));
  const useCols = plotCols.length ? plotCols : numericCols;
  const acc = {};
  useCols.forEach((k) => (acc[k] = {}));
  for (const row of chartData) {
    const c = row[categoryKey];
    for (const k of useCols) {
      const v = Number(row[k]);
      if (Number.isFinite(v)) acc[k][c] = (acc[k][c] || 0) + v;
    }
  }
  const datasets = useCols.map((k) => ({
    label: tr(MEASURE_LABELS, k, locale),
    data: labels.map((c) => (c in acc[k] ? acc[k][c] : null)),
  }));
  return { labels, datasets };
}

const ChatChart = ({
  chartType,
  chartData,
  chartTitle,
  xAxis,
  unit,
  insight,
  locale = "en",
  isDarkMode = false,
}) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const isArabic = locale === "ar";
  const numLocale = locale === "fr" ? "fr-FR" : "en-US";

  const colors = isDarkMode
    ? {
        text: "#efe8d4",
        muted: "rgba(239,232,212,0.6)",
        grid: "rgba(239,232,212,0.10)",
        card: "#0d2b24",
        border: "rgba(201,168,76,0.22)",
        palette: ["#d3b468", "#7ee0c0", "#7a9a8c", "#efdba2", "#c98a3c", "#5b8c7b", "#b8b09d", "#9c7a2e"],
      }
    : {
        text: "#082721",
        muted: "rgba(8,39,33,0.55)",
        grid: "rgba(8,39,33,0.08)",
        card: "#ffffff",
        border: "rgba(8,39,33,0.10)",
        palette: ["#c9a84c", "#0d3d34", "#3d6b5c", "#e8d08a", "#8c6d1f", "#2f6f5e", "#7a9a8c", "#a8894c"],
      };

  // The builders put the x-axis entity into `label`; only "year" charts key on year.
  const categoryKey =
    xAxis === "year" || !(chartData[0] && "label" in chartData[0]) ? "year" : "label";

  const { labels, datasets } = useMemo(
    () => buildSeries({ chartData, categoryKey, locale, chartTitle }),
    [chartData, categoryKey, locale, chartTitle]
  );

  const canChart =
    labels.length > 0 && datasets.length > 0 && datasets.some((d) => d.data.some((v) => v != null));

  const [view, setView] = useState(chartType === "table" || !canChart ? "table" : "chart");

  const fmtFull = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat(numLocale, { maximumFractionDigits: 2 }).format(n);
  };
  const fmtAbbrev = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "";
    const a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (a >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (a >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return fmtFull(n);
  };

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    if (view !== "chart" || !canChart || !canvasRef.current) return undefined;

    const cjsType = chartType === "donut" ? "doughnut" : chartType === "line" ? "line" : "bar";
    const isCircular = cjsType === "doughnut";

    let cjsDatasets;
    if (isCircular) {
      // A doughnut is a single part-to-whole series: collapse any multi-series
      // data (e.g. Export + Import partners) into one total per slice so no
      // series is silently dropped.
      const donutData = labels.map((_, i) => {
        let sum = 0;
        let any = false;
        for (const d of datasets) {
          const v = Number(d.data[i]);
          if (Number.isFinite(v)) {
            sum += v;
            any = true;
          }
        }
        return any ? sum : null;
      });
      cjsDatasets = [
        {
          data: donutData,
          backgroundColor: labels.map((_, i) => colors.palette[i % colors.palette.length]),
          borderColor: colors.card,
          borderWidth: 2,
        },
      ];
    } else {
      cjsDatasets = datasets.map((d, i) => {
        const c = colors.palette[i % colors.palette.length];
        return cjsType === "line"
          ? {
              label: d.label,
              data: d.data,
              borderColor: c,
              backgroundColor: c + "22",
              tension: 0.35,
              fill: false,
              spanGaps: true,
              pointRadius: 2,
              borderWidth: 2,
            }
          : {
              label: d.label,
              data: d.data,
              backgroundColor: c,
              borderColor: c,
              borderWidth: 1,
              borderRadius: 6,
            };
      });
    }

    const showLegend = isCircular || datasets.length > 1;

    chartRef.current = new Chart(canvasRef.current, {
      type: cjsType,
      data: { labels, datasets: cjsDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: showLegend
            ? {
                position: isCircular ? "bottom" : "top",
                rtl: isArabic,
                labels: { color: colors.text, font: { size: 11 }, boxWidth: 12, padding: 8 },
              }
            : { display: false },
          tooltip: {
            rtl: isArabic,
            callbacks: {
              label: (ctx) => {
                const val = isCircular ? ctx.parsed : ctx.parsed.y;
                const name = isCircular ? ctx.label : ctx.dataset.label;
                return `${name}: ${fmtFull(val)}${unit ? " " + unit : ""}`;
              },
            },
          },
        },
        scales: isCircular
          ? {}
          : {
              x: {
                ticks: { color: colors.muted, font: { size: 10 }, maxRotation: 45, autoSkip: true },
                grid: { color: colors.grid },
              },
              y: {
                ticks: { color: colors.muted, font: { size: 10 }, callback: (v) => fmtAbbrev(v) },
                grid: { color: colors.grid },
              },
            },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, canChart, chartType, labels, datasets, isDarkMode, locale, unit]);

  if (labels.length === 0 || datasets.length === 0) return null;

  const catLabel =
    categoryKey === "year"
      ? tr(AXIS_LABELS, "year", locale)
      : tr(AXIS_LABELS, xAxis, locale, humanize(xAxis || "Item"));

  const toggleBtn = (key) => {
    const active = view === key;
    return (
      <button
        key={key}
        onClick={() => setView(key)}
        style={{
          background: active ? colors.palette[0] : "transparent",
          color: active ? "#082721" : colors.muted,
          border: `1px solid ${active ? colors.palette[0] : colors.border}`,
          borderRadius: 6,
          padding: "2px 10px",
          fontSize: "0.72rem",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {tr(UI, key, locale)}
      </button>
    );
  };

  return (
    <div
      style={{
        marginTop: 8,
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 12,
        direction: isArabic ? "rtl" : "ltr",
        boxShadow: isDarkMode ? "none" : "0 2px 10px rgba(8,39,33,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {chartTitle && (
          <h4 style={{ margin: 0, fontSize: "0.82rem", fontWeight: 800, color: colors.text }}>
            {chartTitle}
          </h4>
        )}
        {canChart && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {toggleBtn("chart")}
            {toggleBtn("table")}
          </div>
        )}
      </div>

      {view === "chart" && canChart ? (
        <div style={{ position: "relative", height: 250, width: "100%" }}>
          <canvas ref={canvasRef} />
        </div>
      ) : (
        <div style={{ overflowX: "auto", maxHeight: 260 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", color: colors.text }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: isArabic ? "right" : "left",
                    padding: "6px 8px",
                    borderBottom: `1px solid ${colors.border}`,
                    color: colors.muted,
                    fontWeight: 700,
                  }}
                >
                  {catLabel}
                </th>
                {datasets.map((d) => (
                  <th
                    key={d.label}
                    style={{
                      textAlign: isArabic ? "right" : "left",
                      padding: "6px 8px",
                      borderBottom: `1px solid ${colors.border}`,
                      color: colors.muted,
                      fontWeight: 700,
                    }}
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((lab, i) => (
                <tr key={`${lab}-${i}`}>
                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${colors.grid}`, fontWeight: 600 }}>
                    {lab}
                  </td>
                  {datasets.map((d) => (
                    <td key={d.label} style={{ padding: "6px 8px", borderBottom: `1px solid ${colors.grid}` }}>
                      {d.data[i] == null ? "—" : fmtFull(d.data[i])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(unit || insight) && (
        <div style={{ marginTop: 8, fontSize: "0.72rem", color: colors.muted, lineHeight: 1.4 }}>
          {unit && (
            <span style={{ fontWeight: 700 }}>
              {isArabic ? "الوحدة" : locale === "fr" ? "Unité" : "Unit"}: {unit}
            </span>
          )}
          {unit && insight && " · "}
          {insight && <span style={{ fontStyle: "italic" }}>{insight}</span>}
        </div>
      )}
    </div>
  );
};

export default ChatChart;
