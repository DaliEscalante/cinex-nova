import { useState, useEffect } from "react";
import { Movie } from "@/types";
import { getMovies, saveMovies } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MoviesAdmin = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

    // Validaciones
    if (!editingMovie.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    if (editingMovie.duration <= 0) {
      toast.error("La duración debe ser mayor a 0");
      return;
    }
    if (!editingMovie.rating.trim()) {
      toast.error("La clasificación es obligatoria");
      return;
    }
    if (!editingMovie.genre.trim()) {
      toast.error("El género es obligatorio");
      return;
    }
    if (!editingMovie.description.trim()) {
      toast.error("La descripción es obligatoria");
      return;
    }

    if (isCreating) {
      const newMovie = {
        ...editingMovie,
        id: Math.max(...movies.map(m => m.id), 0) + 1,
      };
      const updatedMovies = [...movies, newMovie];
      saveMovies(updatedMovies);
      setMovies(updatedMovies);
      toast.success("Película creada");
    } else {
      const updatedMovies = movies.map(m =>
        m.id === editingMovie.id ? editingMovie : m
      );
      saveMovies(updatedMovies);
      setMovies(updatedMovies);
      toast.success("Película actualizada");
    }
    
    setIsOpen(false);
    setEditingMovie(null);
    setIsCreating(false);
  };

  const handleDelete = (id: number) => {
    const updatedMovies = movies.filter(m => m.id !== id);
    saveMovies(updatedMovies);
    setMovies(updatedMovies);
    toast.success("Película eliminada");
  };

  const handleCreateNew = () => {
    setEditingMovie({
      id: 0,
      title: "",
      duration: 120,
      rating: "A",
      genre: "",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
      description: "",
      format: "2D",
    });
    setIsCreating(true);
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gradient-cinema">Administrar Películas</h1>
            <Button onClick={handleCreateNew} className="btn-cinema">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Película
            </Button>
          </div>

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
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Badge className="bg-primary px-3 py-1 text-sm font-bold">
                      {movie.rating}
                    </Badge>
                    <Badge className="bg-accent px-3 py-1 text-sm font-bold">
                      {movie.format}
                    </Badge>
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
                          onClick={() => {
                            setEditingMovie(movie);
                            setIsCreating(false);
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </DialogTrigger>
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

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isCreating ? "Crear Película" : "Editar Película"}</DialogTitle>
                <DialogDescription>
                  {isCreating ? "Ingresa los datos de la nueva película" : "Modifica los datos de la película"}
                </DialogDescription>
              </DialogHeader>
              
              {editingMovie && (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <Label>Título *</Label>
                    <Input
                      value={editingMovie.title}
                      onChange={(e) => setEditingMovie({...editingMovie, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duración (minutos) *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editingMovie.duration}
                        onChange={(e) => setEditingMovie({...editingMovie, duration: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Clasificación *</Label>
                      <Input
                        value={editingMovie.rating}
                        onChange={(e) => setEditingMovie({...editingMovie, rating: e.target.value})}
                        required
                        placeholder="A, B, B15, C, D"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Género *</Label>
                      <Input
                        value={editingMovie.genre}
                        onChange={(e) => setEditingMovie({...editingMovie, genre: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Formato *</Label>
                      <Select
                        value={editingMovie.format}
                        onValueChange={(v: "2D" | "3D") => setEditingMovie({...editingMovie, format: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2D">2D</SelectItem>
                          <SelectItem value="3D">3D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>URL de imagen *</Label>
                    <Input
                      value={editingMovie.image}
                      onChange={(e) => setEditingMovie({...editingMovie, image: e.target.value})}
                      required
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Descripción / Sinopsis *</Label>
                    <Textarea
                      value={editingMovie.description}
                      onChange={(e) => setEditingMovie({...editingMovie, description: e.target.value})}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full btn-cinema">
                    {isCreating ? "Crear Película" : "Guardar Cambios"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default MoviesAdmin;
