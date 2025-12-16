// Fallback list; primary source of truth should be the /themes API.
export const FALLBACK_THEME_OPTIONS = [
  { key: "NONE", label: "없음" },
  { key: "FREE", label: "자유" },
  { key: "DAILY", label: "일상" },
  { key: "THOUGHT", label: "생각" },
  { key: "QUESTION", label: "질문" },
  { key: "INFO", label: "정보" },
  { key: "RANT", label: "하소연" },
];

export const THEME_LABEL_MAP = FALLBACK_THEME_OPTIONS.reduce((acc, cur) => {
  acc[cur.key] = cur.label;
  return acc;
}, {});
