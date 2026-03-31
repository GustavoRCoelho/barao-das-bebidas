"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

type BotaoFavoritoProdutoProps = {
  ativo: boolean;
  disabled?: boolean;
  onToggle: () => void;
  className?: string;
};

export function BotaoFavoritoProduto({
  ativo,
  disabled,
  onToggle,
  className,
}: BotaoFavoritoProdutoProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={cn(
        "h-9 w-9 shrink-0 border border-border/80 bg-background/90 shadow-sm backdrop-blur-sm",
        className
      )}
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      aria-label={ativo ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={ativo}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          ativo && "fill-primary text-primary"
        )}
      />
    </Button>
  );
}
