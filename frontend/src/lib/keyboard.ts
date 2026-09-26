const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** "Cmd" on Mac, "Ctrl" elsewhere, for showing shortcuts in labels. */
export const MOD_KEY = isMac ? "Cmd" : "Ctrl";
