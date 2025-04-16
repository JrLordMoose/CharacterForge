import { useCharacter } from '@/context/character-context';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProgressDashboardProps {
  characterId?: string;
  progress: number;
  description?: string;
  onOutlineClick: () => void;
}

export function ProgressDashboard({ 
  characterId, 
  progress, 
  description, 
  onOutlineClick 
}: ProgressDashboardProps) {
  return (
    <div className="col-span-1">
      <div className="bg-secondary rounded-lg p-4 mb-6">
        <h3 className="uppercase tracking-wider text-xs font-bold mb-4 text-muted-foreground">PROGRESS DASHBOARD</h3>
        
        <div className="mb-4">
          <div className="mb-2">Current Phase</div>
          <Progress value={progress} className="h-2.5 mb-1" />
          <div className="text-muted-foreground text-sm">Progress: {progress}%</div>
        </div>
        
        <Button
          variant="outline" 
          className="w-full text-muted-foreground border-muted-foreground hover:text-primary hover:border-primary"
          onClick={onOutlineClick}
        >
          Outline key events
        </Button>
      </div>
      
      <div>
        <h3 className="text-xl mb-2">Description:</h3>
        <p className="text-muted-foreground">
          {description || "No description provided yet"}
        </p>
      </div>
    </div>
  );
}
