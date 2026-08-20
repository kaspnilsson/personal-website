import { NewsletterSignup } from "@/components/newsletter-signup";

export default function HomePage() {
  return (
    <main className="landing-page">
      <div className="landing-content">
        <header className="landing-header">
          <div className="title-eyebrow">Electronic Music Producer / DJ</div>
          <h1 className="display">kasp</h1>
          <div className="title-rule" />
        </header>

        <p className="landing-intro">
          Subscribe for new releases and exclusive content.
        </p>

        <NewsletterSignup />
      </div>
    </main>
  );
}
