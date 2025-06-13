import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

type NarrativeCardProps = {
  insights: string;
};

export function NarrativeCard({ insights }: NarrativeCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Bot className="h-6 w-6 text-accent" />
        <CardTitle className="font-headline text-xl text-primary">AI Narrative Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {insights ? (
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{insights}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No narrative insights available.</p>
        )}
      </CardContent>
    </Card>
  );
}
