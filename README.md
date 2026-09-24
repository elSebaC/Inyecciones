# App Vacunas · Registro de inyecciones

Web mobile-first para registrar cada día en qué zona del cuerpo se inyectó la hormona de crecimiento, con sugerencia de rotación, historial, mapa de calor y estadísticas.

## Stack

- **Next.js 16 + React 19 + Tailwind 4**, todo en el cliente (sin lógica de servidor), desplegable en Vercel.
- **Supabase**: login con Google y Postgres. La seguridad la da Row Level Security (`supabase/schema.sql`): cada usuario solo ve sus datos.
- Al no depender del servidor, el mismo código se puede empaquetar como app Android/iOS con Capacitor (o migrar a Expo reutilizando el mismo backend).
- **Modo prueba**: sin Supabase configurado (o con "Probar sin cuenta"), los datos se guardan en el navegador.

## Zonas

Abdomen en 4 cuadrantes (superior/inferior, derecho/izquierdo), parte trasera de brazo izq/der, frente de muslo izq/der y nalga izq/der. Definidas en `src/lib/zones.ts`.

## Puesta en marcha

1. Crear un proyecto en [Supabase](https://supabase.com) y ejecutar `supabase/schema.sql` en el SQL Editor.
2. En Google Cloud Console crear un "OAuth client ID" (tipo Web) con la URI de redirección `https://<proyecto>.supabase.co/auth/v1/callback`.
3. En Supabase > Authentication > Providers > Google, pegar el Client ID y Secret.
4. En Supabase > Authentication > URL Configuration, poner la URL de Vercel como Site URL y agregarla (y `http://localhost:3000`) a Redirect URLs.
5. Copiar `.env.example` a `.env.local` con la URL y la anon key del proyecto, y en Vercel definir las mismas variables.

```bash
npm install
npm run dev
```
