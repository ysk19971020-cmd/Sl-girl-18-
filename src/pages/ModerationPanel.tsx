import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, CheckCircle, XCircle, Ban, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { getReports, reviewReport, dismissReport } from '@/lib/moderation';
import { getUsers } from '@/lib/storage';
import { Report } from '@/types';

export default function ModerationPanel() {
  const { currentUser, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.isAdmin) {
      navigate('/home');
      return;
    }
    loadReports();
  }, [isLoggedIn, currentUser, navigate]);

  const loadReports = () => {
    const allReports = getReports();
    setReports(allReports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleReviewReport = (reportId: string, action: 'dismiss' | 'warn' | 'suspend' | 'ban') => {
    if (!currentUser) return;
    
    if (action === 'dismiss') {
      dismissReport(reportId, currentUser.id);
    } else {
      reviewReport(reportId, currentUser.id, action);
    }
    
    loadReports();
    setSelectedReport(null);
  };

  const getReporterUsername = (userId: string) => {
    const users = getUsers();
    return users.find(u => u.id === userId)?.username || 'Unknown';
  };

  const getReportedUsername = (userId: string) => {
    const users = getUsers();
    return users.find(u => u.id === userId)?.username || 'Unknown';
  };

  if (!currentUser?.isAdmin) return null;

  const pendingReports = reports.filter(r => r.status === 'pending');
  const reviewedReports = reports.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Shield size={32} />
          Moderation Panel
        </h1>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Reports List */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                Pending Reports ({pendingReports.length})
              </h2>
            </div>
            
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {pendingReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending reports</p>
              ) : (
                pendingReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedReport?.id === report.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive" size={16} />
                        <span className="font-semibold text-foreground capitalize">
                          {report.type} Report
                        </span>
                      </div>
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                        {report.reason.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Reported: <strong>{getReportedUsername(report.reportedUserId)}</strong></p>
                      <p>By: {getReporterUsername(report.reporterId)}</p>
                      <p className="text-xs">{new Date(report.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reviewed Reports Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">
                Recently Reviewed ({reviewedReports.slice(0, 5).length})
              </h3>
              <div className="space-y-2">
                {reviewedReports.slice(0, 5).map((report) => (
                  <div key={report.id} className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {getReportedUsername(report.reportedUserId)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        report.status === 'reviewed'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted-foreground/10 text-muted-foreground'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Details & Actions */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Report Details & Actions</h2>
            
            {selectedReport ? (
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-destructive" size={20} />
                    <span className="font-semibold text-destructive capitalize">
                      {selectedReport.type} Report
                    </span>
                  </div>
                  <p className="text-sm text-foreground">
                    Reason: <strong className="capitalize">{selectedReport.reason.replace('_', ' ')}</strong>
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reported User:</span>
                    <span className="font-semibold text-foreground">
                      {getReportedUsername(selectedReport.reportedUserId)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reported By:</span>
                    <span className="font-semibold text-foreground">
                      {getReporterUsername(selectedReport.reporterId)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Details</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.details || 'No additional details provided.'}</p>
                </div>

                {selectedReport.status === 'pending' && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-3">Take Action</h4>

                    <Button
                      onClick={() => handleReviewReport(selectedReport.id, 'dismiss')}
                      className="w-full flex items-center justify-center gap-2"
                      variant="outline"
                    >
                      <XCircle size={16} />
                      Dismiss Report
                    </Button>

                    <Button
                      onClick={() => handleReviewReport(selectedReport.id, 'warn')}
                      className="w-full flex items-center justify-center gap-2"
                      variant="secondary"
                    >
                      <AlertTriangle size={16} />
                      Issue Warning
                    </Button>

                    <Button
                      onClick={() => handleReviewReport(selectedReport.id, 'suspend')}
                      className="w-full flex items-center justify-center gap-2"
                      variant="destructive"
                    >
                      <Ban size={16} />
                      Suspend User
                    </Button>

                    <Button
                      onClick={() => handleReviewReport(selectedReport.id, 'ban')}
                      className="w-full flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90"
                    >
                      <Ban size={16} />
                      Permanent Ban
                    </Button>
                  </div>
                )}

                {selectedReport.status !== 'pending' && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-primary">
                      This report has been {selectedReport.status}.
                    </p>
                    {selectedReport.reviewedBy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reviewed by admin on {new Date(selectedReport.reviewedAt!).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Select a report to view details and take action
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
