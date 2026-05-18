import flagJordan from "../assets/flags/jordan.webp";
import flagUae from "../assets/flags/uae.webp";
import flagBahrain from "../assets/flags/bahrain.webp";
import flagTunisia from "../assets/flags/tunisia.webp";
import flagAlgeria from "../assets/flags/algeria.webp";
import flagDjibouti from "../assets/flags/djibouti.webp";
import flagSaudi from "../assets/flags/saudiarabe.webp";
import flagSudan from "../assets/flags/sudan.webp";
import flagSyria from "../assets/flags/syria.webp";
import flagSomalia from "../assets/flags/somalia.webp";
import flagIraq from "../assets/flags/iraq.webp";
import flagOman from "../assets/flags/oman.webp";
import flagPalestine from "../assets/flags/palestine.webp";
import flagQatar from "../assets/flags/qatar.webp";
import flagKuwait from "../assets/flags/kuwait.webp";
import flagLebanon from "../assets/flags/lebanon.webp";
import flagLibya from "../assets/flags/libya.webp";
import flagEgypt from "../assets/flags/egypt.webp";
import flagMorocco from "../assets/flags/morocco.webp";
import flagMauritania from "../assets/flags/mauritania.webp";
import flagYemen from "../assets/flags/yemen.webp";

/** ISO 3166-1 alpha-2 (lowercase) → bundled flag asset */
export const countryFlags = {
  jo: flagJordan,
  ae: flagUae,
  bh: flagBahrain,
  tn: flagTunisia,
  dz: flagAlgeria,
  dj: flagDjibouti,
  sa: flagSaudi,
  sd: flagSudan,
  sy: flagSyria,
  so: flagSomalia,
  iq: flagIraq,
  om: flagOman,
  ps: flagPalestine,
  qa: flagQatar,
  kw: flagKuwait,
  lb: flagLebanon,
  ly: flagLibya,
  eg: flagEgypt,
  ma: flagMorocco,
  mr: flagMauritania,
  ye: flagYemen,
};

/** ISO 3166-1 alpha-3 (lowercase) → alpha-2 key in {@link countryFlags} */
export const ISO3_TO_ISO2 = {
  jor: "jo",
  are: "ae",
  bhr: "bh",
  tun: "tn",
  dza: "dz",
  dji: "dj",
  sau: "sa",
  sdn: "sd",
  syr: "sy",
  som: "so",
  irq: "iq",
  omn: "om",
  pse: "ps",
  qat: "qa",
  kwt: "kw",
  lbn: "lb",
  lby: "ly",
  egy: "eg",
  mar: "ma",
  mrt: "mr",
  yem: "ye",
};

export function normalizeCountryCode(rawCode) {
  const code = String(rawCode || "").trim().toLowerCase();
  if (!code) return "";
  if (countryFlags[code]) return code;
  if (ISO3_TO_ISO2[code]) return ISO3_TO_ISO2[code];
  return code;
}

/** URL for bundled Arab-region flag, or `null` if unknown / no asset */
export function getArabCountryFlagUrl(isoRaw) {
  const key = normalizeCountryCode(isoRaw);
  if (!key) return null;
  return countryFlags[key] ?? null;
}
