import type { CapacitorConfig } from "@capacitor/cli";

// appId es el identificador en Play Store y App Store: no se puede cambiar
// después de la primera publicación.
const config: CapacitorConfig = {
  appId: "com.elsebac.inyecciones",
  appName: "Inyecciones",
  webDir: "out",
};

export default config;
