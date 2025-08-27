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
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 mb-6"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};