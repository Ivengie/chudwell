export const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export const formatTagString = (tags, fallback = "") =>
  tags && tags.length ? tags.map(capitalize).join(" · ") : fallback;

export const normalizeTags = (raw) => (raw || "").split(",").map((t) => t.trim()).filter(Boolean);

export const countWords = (text = "") => text.split(/\s+/).filter(Boolean).length;

export const sameId = (a, b) => String(a) === String(b);

// "a-b: c; d: e" -> { aB: "c", d: "e" }  (lets us keep the original inline styles compact)
export const s = (str) =>
  Object.fromEntries(
    str.split(";").map((x) => x.trim()).filter(Boolean).map((x) => {
      const i = x.indexOf(":");
      return [x.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), x.slice(i + 1).trim()];
    })
  );

export const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Could not save", key, e);
  }
};
