import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="px-4 sm:px-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-mono text-sm font-semibold tracking-[-.01em]">
            {title}
          </CardTitle>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn("px-4 sm:px-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

