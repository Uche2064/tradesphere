import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginFormHeaderProps {  
    title: string;
    description: string;
}  

export default function LoginFormHeader({ title, description }: LoginFormHeaderProps) {
    return (
        <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
            {description}
        </CardDescription>
      </CardHeader>
    )
}
