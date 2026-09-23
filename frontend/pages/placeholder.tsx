import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Ainda não construída.
      </CardContent>
    </Card>
  );
}
