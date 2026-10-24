import Link from "next/link";
export default function ReferencePage() {
  return (
    <main className="reference-page">
      <header>
        <Link className="brand" href="/world">
          <span className="brand-symbol">A</span>athena
        </Link>
        <p>Referencia original preservada · experiencia de entregas</p>
        <Link href="/world">Volver a Athena →</Link>
      </header>
      <iframe
        title="Referencia funcional original de Messenger"
        src="/reference/messenger/game/index.html"
        allow="autoplay"
      />
      <p className="reference-caption">
        Esta ruta conserva la base original para verificar modelos, animaciones y comportamiento. No
        es la experiencia educativa de Athena.
      </p>
    </main>
  );
}
