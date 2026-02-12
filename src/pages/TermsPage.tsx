import Header from '@/components/layout/Header';
import { AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-destructive flex-shrink-0" size={24} />
            <div>
              <p className="font-semibold text-destructive">18+ ADULTS ONLY</p>
              <p className="text-sm text-muted-foreground">
                This platform is strictly for adults 18 years and older. By using this service, you confirm you meet this age requirement.
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-6">Terms & Conditions</h1>
          
          <div className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using SL Girl Online, you accept and agree to be bound by these Terms & Conditions. If you do not agree, you must not use this platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. Age Requirement</h2>
              <p className="text-muted-foreground">
                You must be at least 18 years old to use this platform. By registering, you confirm that you are legally an adult in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. User Verification</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>All users must submit a profile photo with a visible face</li>
                <li>Admin reserves the right to verify gender and identity</li>
                <li>False information may result in account suspension</li>
                <li>Profiles are visible only after admin approval</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. Payment & Pricing</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Users must pay platform activation fee before setting prices</li>
                <li>Platform commission: 20% of all transactions</li>
                <li>All payments are final and non-refundable unless stated otherwise</li>
                <li>Payment methods: Bank Transfer, Binance USDT</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. Prohibited Content & Behavior</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Sharing phone numbers, emails, or external links in public listings</li>
                <li>Harassment, abuse, or threatening behavior</li>
                <li>Fake profiles or impersonation</li>
                <li>Scamming or fraudulent activity</li>
                <li>Illegal activities of any kind</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Session & Access Control</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Private features require valid payment and session tokens</li>
                <li>Sessions expire after the allocated time</li>
                <li>No refunds for unused session time</li>
                <li>Platform reserves the right to terminate sessions for violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. Reporting & Moderation</h2>
              <p className="text-muted-foreground">
                Users can report violations. Admin reviews all reports and may issue warnings, suspend, or permanently ban users for policy violations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. Withdrawals</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Minimum withdrawal: Rs 1000</li>
                <li>Withdrawals are manually reviewed and approved by admin</li>
                <li>Processing time: 1-3 business days</li>
                <li>Users must provide accurate payment details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                SL Girl Online is a platform connecting users. We are not responsible for user conduct, interactions, or disputes. Users engage at their own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">11. Account Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate accounts that violate these terms without prior notice or refund.
              </p>
            </section>

            <section className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-3">Contact</h2>
              <p className="text-muted-foreground">
                For questions or concerns, contact: <strong>support@privateconnect.lk</strong>
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
