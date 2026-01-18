import { Card } from "@/lib/components/ui/card";

export default function FormContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="dark:bg-black/30 shadow-md dark:shadow-md">
      {children}
    </Card>
  );
}
