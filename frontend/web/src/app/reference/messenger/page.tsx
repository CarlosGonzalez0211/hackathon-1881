import { t } from "@/lib/i18n";
import Link from "next/link";
export default function ReferencePage() {
  return (
    <main className="reference-page">
      <header>
        <Link className="brand" href="/world">
          <span className="brand-symbol">A</span>athena
        </Link>
        <p>{t("Preserved original reference · delivery experience")}</p>
        <Link href="/world">{t("Back to Athena →")}</Link>
      </header>
      <iframe
        title={t("Original Messenger reference")}
        src="/reference/messenger/game/index.html"
        allow="autoplay"
      />
      <p className="reference-caption">
        {t("The original reference for checking models, animations, and behavior.")}
      </p>
    </main>
  );
}
