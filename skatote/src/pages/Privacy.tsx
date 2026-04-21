export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-text py-24 px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif mb-8 text-white">Privacy Policy</h1>
        <div className="space-y-6 text-text-muted leading-relaxed">
          <p>Last updated: April 2026</p>
          <p>SKA Totes respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our luxury e-commerce platform.</p>
          
          <h2 className="text-2xl font-serif text-white pt-6">1. Information We Collect</h2>
          <p>We may collect identity data (such as name), contact data (such as email address, delivery address), financial data (securely processed via Stripe), and transaction data.</p>
          
          <h2 className="text-2xl font-serif text-white pt-6">2. How We Use Your Data</h2>
          <p>We will only use your personal data to fulfill your orders, provide customer support, and improve our platform. We never sell your data to third parties.</p>

          <h2 className="text-2xl font-serif text-white pt-6">3. Data Security</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way. Payments are processed securely.</p>
        </div>
      </div>
    </div>
  );
}
