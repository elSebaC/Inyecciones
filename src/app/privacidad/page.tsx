import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad · Registro de inyecciones",
};

const UPDATED = "1 de octubre de 2026";

export default function Privacy() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 text-stone-700">
      <Link href="/" className="text-sm font-medium text-[#c9502c]">
        ← Volver a la app
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-800">Política de privacidad</h1>
      <p className="mt-1 text-sm text-stone-500">Última actualización: {UPDATED}</p>

      <div className="mt-6 space-y-6 leading-relaxed [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-stone-800 [&_li]:ml-5 [&_li]:list-disc">
        <section>
          <p>
            &quot;Registro de inyecciones&quot; es una app para que madres, padres y cuidadores anoten cada día dónde
            aplicaron la hormona de crecimiento a un niño o niña, y revisen el historial. Esta política explica qué
            datos guarda la app, para qué y cómo puedes borrarlos.
          </p>
        </section>

        <section>
          <h2>Qué datos guardamos</h2>
          <ul>
            <li>Tu cuenta: correo electrónico, nombre y foto de perfil que entrega Google o Apple al iniciar sesión.</li>
            <li>Datos del paciente que tú ingresas: nombre, fecha de nacimiento y fecha de inicio del tratamiento.</li>
            <li>Registros de inyecciones: fecha y hora, zona del cuerpo, dosis y notas.</li>
            <li>Medidas: altura y peso con su fecha.</li>
          </ul>
          <p className="mt-2">
            En el modo de prueba (sin cuenta) los datos quedan solo en tu teléfono o navegador y no se envían a
            ningún servidor.
          </p>
        </section>

        <section>
          <h2>Para qué los usamos</h2>
          <p>
            Solo para mostrarte tu propio registro, mapas de calor, estadísticas y curvas de crecimiento. No usamos
            tus datos para publicidad, no los vendemos y no los compartimos con terceros. La app no tiene anuncios
            ni herramientas de rastreo.
          </p>
        </section>

        <section>
          <h2>Dónde se guardan</h2>
          <p>
            Los datos de las cuentas se guardan en Supabase, un servicio de base de datos en la nube. Viajan
            cifrados (HTTPS) y cada cuenta solo puede leer y modificar sus propios datos. El inicio de sesión lo
            gestionan Google o Apple; la app nunca recibe tu contraseña.
          </p>
        </section>

        <section>
          <h2>Cómo borrar tus datos</h2>
          <p>
            Puedes borrar registros individuales desde el historial. Para borrar tu cuenta y todos sus datos, abre
            el menú (⋮) y elige &quot;Borrar mi cuenta&quot;. El borrado es inmediato y no se puede deshacer.
          </p>
        </section>

        <section>
          <h2>Menores de edad</h2>
          <p>
            La app está pensada para adultos responsables del tratamiento de un niño o niña, no para que la usen
            directamente los menores. Los datos del menor los ingresa y controla el adulto titular de la cuenta.
          </p>
        </section>

        <section>
          <h2>Aviso médico</h2>
          <p>
            La app es solo un registro. No da indicaciones médicas ni reemplaza las instrucciones del equipo de
            salud que trata al paciente.
          </p>
        </section>

        <section>
          <h2>Cambios</h2>
          <p>Si esta política cambia, actualizaremos esta página y la fecha de arriba.</p>
        </section>
      </div>
    </main>
  );
}
