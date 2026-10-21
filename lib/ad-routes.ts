export function isGameOrFinderPath(pathname: string) {
  const route = pathname.replace(/^\/fr(?=\/|$)/, "").replace(/\/+$/, "") || "/";
  return route === "/" || route === "/solveur-sutom" ||
    /^\/sutom-(?:[3-9]|10|11)-lettres$/.test(route) ||
    /^\/solveur-sutom-(?:[3-9]|10|11)-lettres$/.test(route);
}
