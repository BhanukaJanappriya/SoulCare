import { useToast, toast } from "@/hooks/use-toast";

type Toast = {
  title?: string
  description?: string
  variant?: "default" | "destructive" // <--- THIS IS THE PROBLEM
}


export { useToast, toast };
