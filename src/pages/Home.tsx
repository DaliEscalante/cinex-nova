import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Movie } from "@/types";
import { getMovies } from "@/utils/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Star } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setMovies(getMovies());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-gradient-cinema">
              Cartelera 2025
            </h1>
            <p className="text-xl text-muted-foreground">
              Las mejores películas en pantalla grande
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <Card key={movie.id} className="card-cinema overflow-hidden group">
                <div className="relative overflow-hidden aspect-[2/3]">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3 bg-primary px-3 py-1 rounded-full text-sm font-bold">
                    {movie.rating}
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-bold text-lg line-clamp-1">{movie.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {movie.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-secondary fill-secondary" />
                      {movie.genre}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {movie.description}
                  </p>

                  <Button
                    onClick={() => navigate(`/showtimes/${movie.id}`)}
                    className="w-full btn-cinema"
                  >
                    Ver funciones
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
