import { Header } from "@/components/Header";
import { RecipeCard } from "@/components/RecipeCard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { user, isPremium, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', isPremium],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter premium recipes on client if user is not premium
      if (!isPremium) {
        return data.filter(recipe => !recipe.is_premium);
      }
      
      return data;
    },
    enabled: !!user,
  });

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      
      <Header />
      
      <main className="container py-8 space-y-8 relative">
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
            Entdecke leckere Rezepte
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Von einfachen Cookies bis zu aufwendigen Torten - hier findest du die besten Back-Rezepte
          </p>
          {!isPremium && (
            <p className="text-sm text-primary/80 animate-fade-in">
              💡 Premium-Rezepte sind mit einem Sparkle-Icon markiert
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            recipes?.map((recipe, index) => (
              <div 
                key={recipe.id}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="animate-fade-up"
              >
                <RecipeCard
                  title={recipe.title}
                  description={recipe.description}
                  time={recipe.time}
                  difficulty={recipe.difficulty as "Einfach" | "Mittel" | "Schwer"}
                  category={recipe.category}
                  image={recipe.image_url}
                  isPremium={recipe.is_premium}
                />
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="border-t border-border/40 mt-16 py-8 backdrop-blur-sm bg-background/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 BackZauber - von Alex Gaming Studios</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
