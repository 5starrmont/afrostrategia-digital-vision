import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export const BackButton = ({ href = "/", label = "Back to Home" }: BackButtonProps) => {
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
      size="sm"
      onClick={handleClick}
      className="group border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm transition-all duration-300 mb-6 hover:shadow-md hover:scale-105"
    >
      <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
      {label}
    </Button>
  );
};