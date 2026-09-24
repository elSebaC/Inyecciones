// Las 10 zonas habilitadas, tal como aparecen en la libreta.
// Coordenadas en el sistema del SVG de cada figura (200 x 400).
// Vista de frente: la derecha del niño queda a la izquierda de quien mira.
// Vista de espalda: la izquierda del niño queda a la izquierda de quien mira.

export type View = "front" | "back";

export type ZoneId =
  | "abd_sup_der"
  | "abd_sup_izq"
  | "abd_inf_der"
  | "abd_inf_izq"
  | "brazo_der"
  | "brazo_izq"
  | "muslo_der"
  | "muslo_izq"
  | "nalga_der"
  | "nalga_izq";

export type Zone = {
  id: ZoneId;
  label: string;
  short: string;
  group: "Abdomen" | "Brazo" | "Muslo" | "Nalga";
  view: View;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export const ZONES: Zone[] = [
  { id: "abd_sup_der", label: "Abdomen superior derecho", short: "Abd ↑D", group: "Abdomen", view: "front", cx: 85, cy: 151, rx: 13, ry: 13 },
  { id: "abd_sup_izq", label: "Abdomen superior izquierdo", short: "Abd ↑I", group: "Abdomen", view: "front", cx: 115, cy: 151, rx: 13, ry: 13 },
  { id: "abd_inf_der", label: "Abdomen inferior derecho", short: "Abd ↓D", group: "Abdomen", view: "front", cx: 85, cy: 182, rx: 13, ry: 13 },
  { id: "abd_inf_izq", label: "Abdomen inferior izquierdo", short: "Abd ↓I", group: "Abdomen", view: "front", cx: 115, cy: 182, rx: 13, ry: 13 },
  { id: "muslo_der", label: "Muslo derecho (frente)", short: "Muslo D", group: "Muslo", view: "front", cx: 81, cy: 275, rx: 13, ry: 26 },
  { id: "muslo_izq", label: "Muslo izquierdo (frente)", short: "Muslo I", group: "Muslo", view: "front", cx: 119, cy: 275, rx: 13, ry: 26 },
  { id: "brazo_izq", label: "Brazo izquierdo (atrás)", short: "Brazo I", group: "Brazo", view: "back", cx: 56, cy: 150, rx: 10, ry: 22 },
  { id: "brazo_der", label: "Brazo derecho (atrás)", short: "Brazo D", group: "Brazo", view: "back", cx: 144, cy: 150, rx: 10, ry: 22 },
  { id: "nalga_izq", label: "Nalga izquierda", short: "Nalga I", group: "Nalga", view: "back", cx: 83, cy: 222, rx: 15, ry: 15 },
  { id: "nalga_der", label: "Nalga derecha", short: "Nalga D", group: "Nalga", view: "back", cx: 117, cy: 222, rx: 15, ry: 15 },
];

export const ZONE_IDS = ZONES.map((z) => z.id);

export const zoneById = (id: string) => ZONES.find((z) => z.id === id);
