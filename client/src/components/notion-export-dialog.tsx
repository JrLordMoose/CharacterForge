import { useState, useEffect } from 'react';
import { Character } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, NotebookText } from 'lucide-react';

interface NotionExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
}

interface NotionDatabase {
  id: string;
  title: string;
}

export function NotionExportDialog({ open, onOpenChange, character }: NotionExportDialogProps) {
  const [isNotionAvailable, setIsNotionAvailable] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>('');
  const [customDatabaseId, setCustomDatabaseId] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportedUrl, setExportedUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkNotionStatus();
    } else {
      // Reset state when dialog closes
      setSelectedDatabaseId('');
      setCustomDatabaseId('');
      setUseCustom(false);
      setExporting(false);
      setExportedUrl('');
    }
  }, [open]);

  const checkNotionStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/notion/status');
      const data = await response.json();
      
      setIsNotionAvailable(data.available);
      
      if (data.available) {
        fetchDatabases();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check Notion integration status',
        variant: 'destructive',
      });
      setIsNotionAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const fetchDatabases = async () => {
    try {
      const response = await fetch('/api/notion/databases');
      const data = await response.json();
      setDatabases(data);
      
      if (data.length > 0) {
        setSelectedDatabaseId(data[0].id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch Notion databases',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    if (!isNotionAvailable) return;
    
    const databaseId = useCustom ? customDatabaseId : selectedDatabaseId;
    
    if (!databaseId) {
      toast({
        title: 'Missing Database',
        description: 'Please select or enter a Notion database ID',
        variant: 'destructive',
      });
      return;
    }
    
    setExporting(true);
    try {
      const response = await fetch('/api/notion/export-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: character.id,
          databaseId,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.pageUrl) {
        setExportedUrl(data.pageUrl);
        toast({
          title: 'Character Exported',
          description: 'Character has been successfully exported to Notion',
        });
      } else {
        throw new Error('Failed to export character');
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export character to Notion',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <NotebookText className="mr-2 h-5 w-5" />
            Export to Notion
          </DialogTitle>
          <DialogDescription>
            Export {character.name} to a Notion database for easy reference and organization.
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Checking Notion connection...</span>
          </div>
        ) : !isNotionAvailable ? (
          <div className="py-6 text-center">
            <p className="text-destructive mb-4">Notion integration is not available</p>
            <p className="text-muted-foreground text-sm">
              Please make sure your Notion API key is properly configured.
            </p>
          </div>
        ) : (
          <>
            {exportedUrl ? (
              <div className="py-6">
                <p className="mb-4 text-center text-green-500">Character exported successfully!</p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notion-url">Notion Page URL</Label>
                  <Input 
                    id="notion-url"
                    value={exportedUrl}
                    readOnly
                    className="bg-secondary"
                  />
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => window.open(exportedUrl, '_blank')}
                  >
                    Open in Notion
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="use-custom"
                    checked={useCustom}
                    onChange={(e) => setUseCustom(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="use-custom">Use custom database ID</Label>
                </div>
                
                {useCustom ? (
                  <div className="space-y-2">
                    <Label htmlFor="database-id">Notion Database ID</Label>
                    <Input
                      id="database-id"
                      value={customDatabaseId}
                      onChange={(e) => setCustomDatabaseId(e.target.value)}
                      placeholder="Enter Notion database ID"
                      className="bg-secondary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Find this in your Notion database URL: notion.so/workspace/[database-id]?v=...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="database-select">Select Notion Database</Label>
                    <Select 
                      value={selectedDatabaseId} 
                      onValueChange={setSelectedDatabaseId}
                    >
                      <SelectTrigger id="database-select" className="bg-secondary">
                        <SelectValue placeholder="Select a database" />
                      </SelectTrigger>
                      <SelectContent>
                        {databases.length > 0 ? (
                          databases.map((db) => (
                            <SelectItem key={db.id} value={db.id}>
                              {db.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No databases found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              {!exportedUrl ? (
                <Button 
                  onClick={handleExport} 
                  disabled={exporting || (!selectedDatabaseId && !customDatabaseId)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    'Export to Notion'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => onOpenChange(false)}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}