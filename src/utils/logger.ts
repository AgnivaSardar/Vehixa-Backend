type Meta = Record<string, unknown>;

function formatMeta(meta?: Meta): string {
  if (!meta) return "";
  return ` ${JSON.stringify(meta)}`;
}

export const logger = {
  info(message: string, meta?: Meta) {
    console.info(`[INFO] ${message}${formatMeta(meta)}`);
  },
  warn(message: string, meta?: Meta) {
    console.warn(`[WARN] ${message}${formatMeta(meta)}`);
  },
  error(message: string, meta?: Meta) {
    console.error(`[ERROR] ${message}${formatMeta(meta)}`);
  },
};
