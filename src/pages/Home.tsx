import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Movie } from "@/types";
import { getMovies } from "@/utils/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Star, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    const allMovies = getMovies();
    setMovies(allMovies);
    setFilteredMovies(allMovies);
  }, []);

  useEffect(() => {
    let filtered = movies;

    if (selectedGenre !== "all") {
      filtered = filtered.filter(m => m.genre === selectedGenre);
    }

    if (selectedFormat !== "all") {
      filtered = filtered.filter(m => m.format === selectedFormat);
    }

    setFilteredMovies(filtered);
  }, [selectedGenre, selectedFormat, movies]);

  const genres = [...new Set(movies.map(m => m.genre))];

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

          {/* Filtros */}
          <Card className="card-cinema mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Filtros:</span>
                </div>
                
                <div className="flex gap-4 flex-wrap flex-1">
                  <div className="min-w-[200px]">
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los géneros</SelectItem>
                        {genres.map(genre => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[150px]">
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los formatos</SelectItem>
                        <SelectItem value="2D">2D</SelectItem>
                        <SelectItem value="3D">3D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedGenre !== "all" || selectedFormat !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedGenre("all");
                        setSelectedFormat("all");
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredMovies.length === 0 ? (
            <Card className="card-cinema">
              <CardContent className="p-12 text-center">
                <p className="text-xl text-muted-foreground">
                  No se encontraron películas con los filtros seleccionados
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMovies.map((movie) => (
                <Card key={movie.id} className="card-cinema overflow-hidden group">
                  <div className="relative overflow-hidden aspect-[2/3]">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <Badge className="bg-primary px-3 py-1 text-sm font-bold">
                        {movie.rating}
                      </Badge>
                      <Badge className="bg-accent px-3 py-1 text-sm font-bold">
                        {movie.format}
                      </Badge>
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
