import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecipeCardProps {
  title: string;
  description: string;
  time: string;
  difficulty: "Einfach" | "Mittel" | "Schwer";
  category: string;
  image: string;
  isPremium?: boolean;
}

export const RecipeCard = ({ title, description, time, difficulty, category, image, isPremium }: RecipeCardProps) => {
  const difficultyColors = {
    "Einfach": "bg-green-500/10 text-green-500 border-green-500/20",
    "Mittel": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "Schwer": "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-up border-border/50 bg-gradient-to-br from-card to-card/50">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {isPremium && (
          <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm border-primary-glow animate-glow-pulse">
            <Sparkles className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
        <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm">
          {category}
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {time}
          </div>
          <Badge variant="outline" className={difficultyColors[difficulty]}>
            <ChefHat className="h-3 w-3 mr-1" />
            {difficulty}
          </Badge>
        </div>
        
        <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          Rezept ansehen
        </Button>
      </CardContent>
    </Card>
  );
};
