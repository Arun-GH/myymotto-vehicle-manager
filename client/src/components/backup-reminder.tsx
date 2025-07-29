import { useState, useEffect } from 'react';
import { AlertTriangle, X, HardDrive, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BackupManager } from '@/lib/backup-utils';
import { useToast } from '@/hooks/use-toast';

export default function BackupReminder() {
  const { toast } = useToast();
  const [showReminder, setShowReminder] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    // Check if backup reminder should be shown
    const shouldShow = BackupManager.shouldShowBackupReminder();
    const reminderDismissed = localStorage.getItem('backupReminderDismissed');
    const today = new Date().toDateString();
    
    // Show reminder if needed and not dismissed today
    if (shouldShow && reminderDismissed !== today) {
      setShowReminder(true);
      // Mark that reminder was shown this month
      localStorage.setItem('lastBackupReminderShown', new Date().toISOString());
    }
  }, []);

  const handleQuickBackup = async () => {
    setIsBackingUp(true);
    try {
      const userId = localStorage.getItem('currentUserId') || '1';
      await BackupManager.exportToFile(userId);
      BackupManager.markBackupCompleted();
      
      toast({
        title: "Backup Downloaded",
        description: "Your data has been saved to downloads. Upload to Google Drive for safety.",
      });
      
      setShowReminder(false);
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Please try again from Settings page.",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDismiss = () => {
    // Dismiss reminder for today
    localStorage.setItem('backupReminderDismissed', new Date().toDateString());
    setShowReminder(false);
  };

  if (!showReminder) return null;

  return (
    <Card className="mb-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-orange-800 mb-1">
              Backup Reminder
            </h3>
            <p className="text-xs text-orange-700 mb-3">
              Monthly backup reminder: Keep your vehicle documents safe when switching phones.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={handleQuickBackup}
                disabled={isBackingUp}
                size="sm"
                className="h-7 bg-orange-600 hover:bg-orange-700 text-white text-xs"
              >
                {isBackingUp ? (
                  <HardDrive className="w-3 h-3 mr-1 animate-pulse" />
                ) : (
                  <Download className="w-3 h-3 mr-1" />
                )}
                Quick Backup
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="outline"
                className="h-7 text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Later
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="p-1 h-6 w-6 text-orange-600 hover:bg-orange-100 flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}