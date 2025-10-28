import { useState, useEffect } from "react";
import { Movie } from "@/types";
import { getMovies, saveMovies } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MoviesAdmin = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMovies(getMovies());
  }, []);

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMovie) return;

    const updatedMovies = movies.map(m =>
      m.id === editingMovie.id ? editingMovie : m
    );
    
    saveMovies(updatedMovies);
    setMovies(updatedMovies);
    setIsOpen(false);
    setEditingMovie(null);
    toast.success("Película actualizada");
  };

  const handleDelete = (id: number) => {
    const updatedMovies = movies.filter(m => m.id !== id);
    saveMovies(updatedMovies);
    setMovies(updatedMovies);
    toast.success("Película eliminada");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gradient-cinema">Administrar Películas</h1>

          <Card className="card-cinema mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por título o género..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMovies.map(movie => (
              <Card key={movie.id} className="card-cinema overflow-hidden group">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-primary px-3 py-1 rounded-full text-sm font-bold">
                    {movie.rating}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Género:</span>
                      <Badge variant="secondary">{movie.genre}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duración:</span>
                      <span className="font-semibold">{movie.duration} min</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {movie.description}
                  </p>

                  <div className="flex gap-2">
                    <Dialog open={isOpen && editingMovie?.id === movie.id} onOpenChange={setIsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setEditingMovie(movie)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Película</DialogTitle>
                          <DialogDescription>
                            Modifica los datos de la película
                          </DialogDescription>
                        </DialogHeader>
                        
                        {editingMovie && (
                          <form onSubmit={handleSave} className="space-y-4">
                            <div>
                              <Label>Título</Label>
                              <Input
                                value={editingMovie.title}
                                onChange={(e) => setEditingMovie({...editingMovie, title: e.target.value})}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Duración (minutos)</Label>
                                <Input
                                  type="number"
                                  value={editingMovie.duration}
                                  onChange={(e) => setEditingMovie({...editingMovie, duration: parseInt(e.target.value)})}
                                  required
                                />
                              </div>
                              <div>
                                <Label>Clasificación</Label>
                                <Input
                                  value={editingMovie.rating}
                                  onChange={(e) => setEditingMovie({...editingMovie, rating: e.target.value})}
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Género</Label>
                              <Input
                                value={editingMovie.genre}
                                onChange={(e) => setEditingMovie({...editingMovie, genre: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label>URL de imagen</Label>
                              <Input
                                value={editingMovie.image}
                                onChange={(e) => setEditingMovie({...editingMovie, image: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label>Descripción</Label>
                              <Textarea
                                value={editingMovie.description}
                                onChange={(e) => setEditingMovie({...editingMovie, description: e.target.value})}
                                rows={4}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full btn-cinema">
                              Guardar cambios
                            </Button>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(movie.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MoviesAdmin;
