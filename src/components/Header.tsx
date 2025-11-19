import { Cookie, User, LogOut, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";

export const Header = () => {
  const { user, isPremium, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="relative">
            <Cookie className="h-8 w-8 text-primary animate-glow-pulse" />
            <div className="absolute inset-0 blur-lg bg-primary/20 animate-glow-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
              BackZauber
            </h1>
            <p className="text-xs text-muted-foreground">von Alex Gaming Studios</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {user && isPremium && (
            <Badge className="bg-gradient-to-r from-primary to-accent border-0 animate-glow-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          
          <ThemeToggle />
          
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="relative group"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <User className="h-4 w-4 mr-2" />
              Anmelden
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
