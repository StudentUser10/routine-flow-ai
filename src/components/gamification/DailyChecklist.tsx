import { useEffect } from 'react';
import { CheckCircle2, Circle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useGamification, BlockStatusType } from '@/hooks/useGamification';

interface Block {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  block_type: string;
  day_of_week: number;
}

interface DailyChecklistProps {
  blocks: Block[];
  className?: string;
}

export function DailyChecklist({ blocks, className }: DailyChecklistProps) {
  const { 
    dailyProgress, 
    initializeDayChecklist, 
    updateBlockStatus, 
    getBlockStatus,
    loading 
  } = useGamification();

  const todayDayOfWeek = new Date().getDay();
  const todaysBlocks = blocks.filter(b => b.day_of_week === todayDayOfWeek);

  useEffect(() => {
    if (todaysBlocks.length > 0 && !loading) {
      initializeDayChecklist(todaysBlocks);
    }
  }, [todaysBlocks.length, loading]);

  const handleStatusChange = async (blockId: string, currentStatus: BlockStatusType) => {
    // Cycle through: pending -> completed -> skipped -> pending
    let newStatus: BlockStatusType;
    switch (currentStatus) {
      case 'pending':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'skipped';
        break;
      case 'skipped':
        newStatus = 'pending';
        break;
      default:
        newStatus = 'completed';
    }
    await updateBlockStatus(blockId, newStatus);
  };

  const getStatusIcon = (status: BlockStatusType) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-rest-block" />;
      case 'skipped':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const progress = dailyProgress?.completion_percentage || 0;
  const completed = dailyProgress?.blocks_completed || 0;
  const total = dailyProgress?.blocks_total || todaysBlocks.length;

  if (todaysBlocks.length === 0) {
    return (
      <div className={cn("p-4 bg-card border border-border rounded-xl", className)}>
        <h3 className="font-display font-semibold mb-2">Checklist do Dia</h3>
        <p className="text-sm text-muted-foreground">Nenhum bloco programado para hoje.</p>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-card border border-border rounded-xl space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">Checklist do Dia</h3>
        <span className="text-sm text-muted-foreground">{completed}/{total}</span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {todaysBlocks.map(block => {
          const status = getBlockStatus(block.id);
          return (
            <Button
              key={block.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-auto py-2 px-3",
                status === 'completed' && "bg-rest-block/10",
                status === 'skipped' && "bg-destructive/10 line-through opacity-60"
              )}
              onClick={() => handleStatusChange(block.id, status)}
            >
              {getStatusIcon(status)}
              <div className="flex-1 text-left">
                <span className="block text-sm font-medium">{block.title}</span>
                <span className="block text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {block.start_time} - {block.end_time}
                </span>
              </div>
            </Button>
          );
        })}
      </div>

      {progress >= 70 && (
        <p className="text-sm text-rest-block font-medium text-center">
          🎉 Dia válido! Sua sequência está mantida!
        </p>
      )}
    </div>
  );
}
