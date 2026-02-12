import Header from '@/components/layout/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
          
          <div className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Profile information (username, email, gender, age confirmation)</li>
                <li>Profile photos and descriptions</li>
                <li>Payment information (bank details, crypto addresses)</li>
                <li>Chat messages and call session data</li>
                <li>Transaction history and wallet balances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Verify user identity and age</li>
                <li>Process payments and withdrawals</li>
                <li>Facilitate private chat, voice, and video sessions</li>
                <li>Enforce platform rules and moderation</li>
                <li>Improve user experience and platform features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. Data Security</h2>
              <p className="text-muted-foreground">
                We implement security measures to protect your data. However, no system is 100% secure. Users are responsible for maintaining the confidentiality of their login credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Data Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell or share your personal information with third parties, except:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>When required by law or legal process</li>
                <li>To payment processors for transaction processing</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Session Data</h2>
              <p className="text-muted-foreground">
                Chat messages and call sessions are logged for security and moderation purposes. Sessions expire and are deleted after completion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. User Rights</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Withdraw consent for data processing</li>
                <li>Export your data in a readable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Cookies & Tracking</h2>
              <p className="text-muted-foreground">
                We use local storage to maintain session state and user preferences. No third-party tracking or advertising cookies are used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Data Retention</h2>
              <p className="text-muted-foreground">
                User data is retained as long as accounts are active. Upon account deletion, data is permanently removed within 30 days, except where required for legal compliance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                This platform is strictly for adults 18+. We do not knowingly collect information from minors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. Changes to Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this policy. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-3">Contact</h2>
              <p className="text-muted-foreground">
                Privacy concerns: <strong>privacy@privateconnect.lk</strong>
              </p>
            </section>
          </div>

          <p className="text-xs text-muted-foreground mt-8 text-center">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
