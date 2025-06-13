import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  unit?: string;
  description?: string;
  className?: string;
  valueClassName?: string;
};

export function StatCard({ title, value, icon, unit, description, className, valueClassName }: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        return val.toLocaleString();
      }
      // Check for common financial metrics needing specific formatting
      if (title.toLowerCase().includes('p/l') || title.toLowerCase().includes('profit') || title.toLowerCase().includes('loss') || title.toLowerCase().includes('price')) {
        return val.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
      }
      if (title.toLowerCase().includes('rate') || title.toLowerCase().includes('percentage')) {
         return `${val.toFixed(2)}%`;
      }
      return val.toFixed(2);
    }
    return val;
  };


  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-accent">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold font-headline text-primary", valueClassName)}>
          {formatValue(value)}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
