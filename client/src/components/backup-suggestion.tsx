import { useState } from 'react';
import { HardDrive, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BackupManager } from '@/lib/backup-utils';
import { useToast } from '@/hooks/use-toast';

interface BackupSuggestionProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function BackupSuggestion({ isOpen, onClose, message }: BackupSuggestionProps) {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      const userId = localStorage.getItem('currentUserId') || '1';
      await BackupManager.exportToFile(userId);
      BackupManager.markBackupCompleted();
      
      toast({
        title: "Backup Created",
        description: "Your data has been downloaded. Save it to Google Drive or email to yourself.",
      });
      
      onClose();
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

  const handleLater = () => {
    // Store that user chose to backup later
    localStorage.setItem('backupSuggestionPostponed', new Date().toISOString());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-md mx-auto rounded-xl bg-white/95 backdrop-blur border-orange-200 shadow-2xl shadow-orange-500/20">
        <DialogHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center mx-auto mb-3">
            <HardDrive className="w-6 h-6 text-orange-600" />
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Keep Your Data Safe
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            {message}
          </p>
          
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs text-orange-700 text-center">
              💡 Tip: Regular backups protect your vehicle documents when switching phones
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="flex-1 h-11 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              {isBackingUp ? (
                <HardDrive className="w-4 h-4 mr-2 animate-pulse" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Backup Now
            </Button>
            <Button
              onClick={handleLater}
              variant="outline"
              className="h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}