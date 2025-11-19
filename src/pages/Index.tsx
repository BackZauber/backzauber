import { Header } from "@/components/Header";
import { RecipeCard } from "@/components/RecipeCard";

const sampleRecipes = [
  {
    title: "Schoko-Cookies",
    description: "Knusprige Cookies mit zartschmelzenden Schokostückchen. Ein Klassiker, der immer gelingt!",
    time: "25 Min",
    difficulty: "Einfach" as const,
    category: "Cookies",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
    isPremium: false,
  },
  {
    title: "Saftiger Marmorkuchen",
    description: "Der perfekte Marmorkuchen mit einer wunderschönen Marmorierung und saftigem Teig.",
    time: "60 Min",
    difficulty: "Mittel" as const,
    category: "Kuchen",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    isPremium: true,
  },
  {
    title: "Zimtschnecken",
    description: "Fluffige Zimtschnecken mit cremigem Frosting - ein Traum für jeden Zimtfan!",
    time: "90 Min",
    difficulty: "Schwer" as const,
    category: "Gebäck",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    isPremium: true,
  },
  {
    title: "Vanille-Cupcakes",
    description: "Zarte Cupcakes mit Vanille-Buttercreme und bunten Streuseln.",
    time: "40 Min",
    difficulty: "Einfach" as const,
    category: "Cupcakes",
    image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800&q=80",
    isPremium: false,
  },
  {
    title: "Mandel-Makronen",
    description: "Knusprige Außenseite, weicher Kern - die perfekten Mandel-Makronen.",
    time: "35 Min",
    difficulty: "Mittel" as const,
    category: "Gebäck",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    isPremium: true,
  },
  {
    title: "Erdnussbutter-Cookies",
    description: "Amerikanische Cookies mit cremiger Erdnussbutter - unwiderstehlich lecker!",
    time: "20 Min",
    difficulty: "Einfach" as const,
    category: "Cookies",
    image: "https://images.unsplash.com/photo-1486893732792-ab0085cb2d43?w=800&q=80",
    isPremium: false,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
            Entdecke leckere Rezepte
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Von einfachen Cookies bis zu aufwendigen Torten - hier findest du die besten Back-Rezepte
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleRecipes.map((recipe, index) => (
            <div 
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <RecipeCard {...recipe} />
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/40 mt-16 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 BackZauber - von Alex Gaming Studios</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
