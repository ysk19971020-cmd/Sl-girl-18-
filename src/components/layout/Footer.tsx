import { Link } from 'react-router-dom';
import { Shield, FileText, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold text-2xl mb-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">YOUR SEXY</h3>
            <h4 className="font-semibold text-base mb-3 text-foreground">SL Girl Online</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Secure platform for verified connections. 18+ only.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Admin Contact:</p>
              <p>J A Y S Kavinda</p>
              <p>WhatsApp: +94 76 585 1997</p>
              <p className="break-all">jayakodyarachchigemahisha@gmail.com</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Legal</h4>
            <div className="space-y-2">
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                <FileText size={14} />
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
                <Lock size={14} />
                Privacy Policy
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Safety</h4>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Shield size={14} className="mt-0.5" />
              <p>All users verified. Report abuse immediately.</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-6 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SL Girl Online. All rights reserved. | Adults 18+ Only
          </p>
        </div>
      </div>
    </footer>
  );
}
