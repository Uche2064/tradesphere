import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RegisterHeaderProps {
  step: number;
  totalSteps?: number;
  title: string;
  description: string;
}

export default function RegisterHeader({
  step,
  totalSteps = 2,
  title,
  description,
}: RegisterHeaderProps) {
  const progressValue = (step / totalSteps) * 100;

  return (
    <CardHeader>
      <div className="space-y-2">
        <Progress value={progressValue} className="h-2 rounded-full" />
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Étape {step} sur {totalSteps}
        </p>
      </div>
      <CardTitle className="text-2xl font-bold tracking-tight text-center">
        {title}
      </CardTitle>
      <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
        {description}
        <div className="text-xs mt-3">
          Les champs marqués d&apos;un astérisque (*) sont obligatoires
        </div>
      </CardDescription>
    </CardHeader>
  );
}
