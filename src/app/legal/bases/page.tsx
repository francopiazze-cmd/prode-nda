import Link from "next/link";

/**
 * PLACEHOLDER. Reemplazar este texto por las bases legales redactadas /
 * revisadas por un abogado antes de lanzar al público.
 */
export default function BasesPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 prose prose-sm">
      <h1>Bases y condiciones — Prode NDA Mundial 2026</h1>

      <p><em>(Placeholder — pendiente revisión legal)</em></p>

      <h2>1. Organizador</h2>
      <p>NDA Asesores, con domicilio en [DOMICILIO], CUIT [CUIT].</p>

      <h2>2. Mecánica del concurso</h2>
      <p>
        Es un concurso de habilidad consistente en pronosticar resultados de los partidos del Mundial FIFA 2026.
        El ganador es quien obtenga la mayor cantidad de puntos al cierre de la fase de grupos según el sistema de
        puntuación detallado en estas bases. <strong>No interviene el azar en la determinación del ganador.</strong>
      </p>

      <h2>3. Sistema de puntaje</h2>
      <ul>
        <li>Resultado exacto: 5 puntos</li>
        <li>Ganador y diferencia de goles: 3 puntos</li>
        <li>Solo ganador o empate: 1 punto</li>
        <li>Multiplicador en partidos de eliminación directa: x2</li>
        <li>
          Bonus por amigo referido que juega al menos 1 pronóstico: 2 puntos al ranking principal,
          hasta un máximo de 10 referidos (es decir, hasta 20 puntos por este concepto). Los referidos
          que excedan ese tope no suman al ranking principal pero cuentan para el premio Embajador
          (ver sección 5).
        </li>
        <li>
          Bonus único para clientes asegurados de NDA: 20 puntos.
          Se otorga una sola vez cuando el participante declara su condición de asegurado al registrarse,
          informa la patente del vehículo asegurado (o número de póliza si corresponde) y NDA Asesores verifica
          la titularidad de la póliza vigente. La verificación es manual y puede tardar hasta 48 horas hábiles.
          El bonus no es transferible y se invalida si la póliza no resulta confirmada.
        </li>
      </ul>

      <p>
        Los pronósticos se cierran 5 minutos antes del kickoff de cada partido. Después de ese momento no se
        admiten cargas ni modificaciones.
      </p>

      <h2>4. Desempate</h2>
      <p>
        En caso de empate en puntos, gana quien tenga más resultados exactos. Si persiste el empate, quien tenga
        más aciertos en partidos de la Selección Argentina. Si aún persiste, quien se haya registrado primero. El
        desempate es 100% por habilidad y orden temporal — no se realizan sorteos.
      </p>

      <h2>5. Premios</h2>
      <ul>
        <li><strong>1° puesto del ranking general:</strong> Smart TV 55" (marca y modelo a confirmar al cierre del concurso).</li>
        <li><strong>2° puesto del ranking general:</strong> Cafetera Nespresso (modelo a confirmar).</li>
        <li><strong>3° puesto del ranking general:</strong> Gift card para una cena en Kansas Nordelta.</li>
        <li>
          <strong>Premio Embajador:</strong> participante con mayor cantidad de referidos confirmados (sin tope).
          Se otorga en forma independiente del ranking general. [Premio a definir.] En caso de empate, gana el
          participante cuyo último referido confirmado se registró primero.
        </li>
      </ul>
      <p className="text-xs text-nda-dark/60">
        Los premios no son canjeables por dinero. NDA Asesores se reserva el derecho de sustituir cualquier
        premio por uno de valor equivalente si por causas ajenas no pudiera entregarse el originalmente ofrecido.
      </p>

      <h2>6. Vigencia</h2>
      <p>Desde [FECHA INICIO] hasta el cierre de la fase de grupos del Mundial 2026.</p>

      <h2>7. Tratamiento de datos personales</h2>
      <p>
        Los datos de los participantes se tratan según nuestra <Link href="/legal/privacidad">política de privacidad</Link>,
        en cumplimiento con la Ley 25.326. NDA Asesores está inscripto como responsable de base de datos en la AAIP.
      </p>

      <p className="text-xs text-nda-dark/60 mt-12">
        Última actualización: [FECHA]. Para consultas escribir a prode@ndasesores.com.ar.
      </p>
    </main>
  );
}
