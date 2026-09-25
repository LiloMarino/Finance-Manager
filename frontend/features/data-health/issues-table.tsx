import { Link } from "react-router-dom";

import type { DataIssue } from "@/features/data-health/use-data-health";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface IssuesTableProps {
  issues: DataIssue[];
  subjectLabel: string;
  actionLabel: string;
}

export function IssuesTable({ issues, subjectLabel, actionLabel }: IssuesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{subjectLabel}</TableHead>
          <TableHead>O que falta</TableHead>
          <TableHead>O que fica errado</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.map((issue) => (
          <TableRow key={`${issue.kind}-${issue.subject}`}>
            <TableCell className="font-medium">{issue.subject}</TableCell>
            <TableCell className="whitespace-normal">{issue.missing}</TableCell>
            <TableCell className="text-muted-foreground whitespace-normal">
              {issue.affects}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={issue.path}>{actionLabel}</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
