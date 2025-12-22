import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export const BackButton = ({ href = "/", label = "Back to Home", className }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (href === "back") {
      navigate(-1);
    } else {
      navigate(href);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      className={`group border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm transition-all duration-300 mb-6 hover:shadow-md hover:scale-110 rounded-full ${className || ''}`}
    >
      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
    </Button>
  );
};