export const PRODUCTION_HOSTNAME = "jeuxdelettes.com";

export const SITE_SCRIPTS = {
  googleAnalytics: true,
  adsterraBanners: true,
  adsterraSocialBar: true,
  adsterraPopunder: true,
};

export const DESKTOP_RAIL_QUERY = "(min-width: 1440px) and (hover: hover) and (pointer: fine)";
export const MOBILE_MEDIA_QUERY = "(max-width: 768px)";
export const SOCIALBAR_SCRIPT_SRC = "https://bicea.org/14/aac49f8d97975a050e951fc2c5fb00b0";
export const POPUNDER_SCRIPT_SRC = "https://afders.org/1/820521bbbd90cbc52f341ad60f472feb";
export const BANNER_UNITS = {
  left: { key: "bd82b0704b2f3a2ac9fb4ce25e16785b", width: 160, height: 300 },
  right: { key: "0821348cae24c3f42c60faeec71290c0", width: 160, height: 600 },
} as const;

export function isProductionSite(environment: string | undefined, hostname: string) {
  return environment === "production" && hostname === PRODUCTION_HOSTNAME;
}

export function canLoadProductionScripts() {
  return typeof window !== "undefined" && isProductionSite(process.env.NODE_ENV, window.location.hostname);
}
