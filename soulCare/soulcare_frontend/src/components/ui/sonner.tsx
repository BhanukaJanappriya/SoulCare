import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#48C9B0] group-[.toaster]:text-black group-[.toaster]:border-none group-[.toaster]:shadow-lg",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-[#48C9B0]/60",
          description:
            "group-[.toast]:text-black/90",
          cancelButton:
            "group-[.toast]:bg-black/20 group-[.toast]:text-black/30"
        }
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
