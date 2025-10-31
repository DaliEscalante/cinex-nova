import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Showtime, Seat, Movie, Room } from "@/types";
import { getShowtimes, getSeats, saveSeats, getMovies, getRooms, getCart, saveCart } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SeatMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    const showtimeId = parseInt(id || "0");
    const showtimes = getShowtimes();
    const foundShowtime = showtimes.find(s => s.id === showtimeId);
    
    if (foundShowtime) {
      setShowtime(foundShowtime);
      setSeats(getSeats(showtimeId));
      
      const movies = getMovies();
      setMovie(movies.find(m => m.id === foundShowtime.movieId) || null);
      
      const rooms = getRooms();
      setRoom(rooms.find(r => r.id === foundShowtime.roomId) || null);
    }
  }, [id]);

  const toggleSeat = (row: string, number: number) => {
    const seat = seats.find(s => s.row === row && s.number === number);
    if (!seat || seat.status === "sold" || seat.status === "reserved") return;

    // Validación según tipo de sala
    if (room?.type === "vip" && seat.status !== "vip") {
      toast.error("⭐ Esta es una función VIP exclusiva. Solo puedes seleccionar asientos VIP (filas I y J - color amarillo)");
      return;
    }
    
    if (room?.type === "standard" && seat.status === "vip") {
      toast.error("ℹ️ Esta es una función estándar. No puedes seleccionar asientos VIP para esta función.");
      return;
    }

    const seatId = `${row}${number}`;
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      toast.error("Selecciona al menos un asiento");
      return;
    }

    const cart = getCart();
    selectedSeats.forEach(seatId => {
      cart.push({
        type: "ticket",
        name: `${movie?.title} - Sala ${room?.name} - Asiento ${seatId}`,
        price: showtime?.price || 0,
        showtimeId: showtime?.id,
        seat: seatId,
      });
    });
    saveCart(cart);

    // Update seat status
    const updatedSeats = seats.map(seat => {
      const seatId = `${seat.row}${seat.number}`;
      if (selectedSeats.includes(seatId)) {
        return { ...seat, status: "reserved" as const };
      }
      return seat;
    });
    saveSeats(parseInt(id || "0"), updatedSeats);

    toast.success(`${selectedSeats.length} asiento(s) agregado(s) al carrito`);
    navigate("/products");
  };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-32 px-4 animate-fade-in">
        <div className="container mx-auto max-w-6xl">
          {movie && showtime && room && (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">{movie.title}</h1>
                <p className="text-muted-foreground text-lg">
                  {room.name} - {showtime.date} {showtime.time} - ${showtime.price}
                </p>
                {room?.type === "vip" && (
                  <Alert className="mt-4 max-w-2xl mx-auto border-accent bg-accent/20 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    <AlertDescription className="text-foreground font-semibold">
                      ⭐ FUNCIÓN VIP EXCLUSIVA - Solo puedes seleccionar asientos VIP (filas I y J - color amarillo)
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Card className="bg-card/80 backdrop-blur-sm border-border mb-6">
                <CardContent className="p-6 md:p-8">
                  {/* Leyenda con chips scrollables */}
                  <div className="mb-8 overflow-x-auto pb-2">
                    <div className="flex justify-center gap-3 md:gap-4 min-w-max px-2">
                      <div className="chip bg-transparent text-foreground border-border" style={{ borderColor: 'hsl(var(--seat-available))' }}>
                        <div className="seat seat-available w-8 h-8 mr-2" />
                        <span className="text-xs md:text-sm whitespace-nowrap">Disponible</span>
                      </div>
                      <div className="chip bg-transparent text-foreground border-border" style={{ borderColor: 'hsl(var(--seat-selected))' }}>
                        <div className="seat seat-selected w-8 h-8 mr-2" />
                        <span className="text-xs md:text-sm whitespace-nowrap">Seleccionado</span>
                      </div>
                      <div className="chip bg-transparent text-foreground border-border" style={{ borderColor: 'hsl(var(--seat-vip))' }}>
                        <div className="seat seat-vip w-8 h-8 mr-2" />
                        <span className="text-xs md:text-sm whitespace-nowrap">VIP</span>
                      </div>
                      <div className="chip bg-transparent text-foreground border-border" style={{ borderColor: 'hsl(var(--seat-reserved))' }}>
                        <div className="seat seat-reserved w-8 h-8 mr-2" />
                        <span className="text-xs md:text-sm whitespace-nowrap">Reservado</span>
                      </div>
                      <div className="chip bg-transparent text-foreground border-border" style={{ borderColor: 'hsl(var(--seat-sold))' }}>
                        <div className="seat seat-sold w-8 h-8 mr-2" />
                        <span className="text-xs md:text-sm whitespace-nowrap">Vendido</span>
                      </div>
                    </div>
                  </div>

                  {/* Pantalla de cine con efecto glow */}
                  <div className="mb-12 screen-glow">
                    <div className="h-3 rounded-full mb-3" 
                      style={{
                        background: 'linear-gradient(90deg, transparent, hsl(230 100% 60%), hsl(270 70% 65%), transparent)',
                        boxShadow: '0 0 40px hsl(230 100% 60% / 0.6), 0 4px 20px rgba(0,0,0,0.5)'
                      }}
                    />
                    <p className="text-center text-sm font-semibold text-foreground uppercase tracking-widest">PANTALLA</p>
                  </div>

                  {/* Mapa de asientos */}
                  <div className="overflow-x-auto">
                    <div className="space-y-4 min-w-max px-4">
                      {rows.map(row => (
                        <div key={row} className="flex items-center justify-center gap-3">
                          <span className="w-10 text-center font-bold text-xl text-foreground sticky left-0 bg-card/90 backdrop-blur-sm z-10 py-2 px-2 rounded-lg">
                            {row}
                          </span>
                          {[...Array(16)].map((_, idx) => {
                          const number = idx + 1;
                          const seat = seats.find(s => s.row === row && s.number === number);
                          const seatId = `${row}${number}`;
                          const isSelected = selectedSeats.includes(seatId);
                          
                          let seatClass = "seat animate-pop ";
                          if (isSelected) seatClass += "seat-selected";
                          else if (seat?.status === "vip") seatClass += "seat-vip";
                          else if (seat?.status === "reserved") seatClass += "seat-reserved";
                          else if (seat?.status === "sold") seatClass += "seat-sold";
                          else seatClass += "seat-available";

                          return (
                            <div
                              key={number}
                              className={`${seatClass} relative`}
                              onClick={() => toggleSeat(row, number)}
                              style={{ animationDelay: `${((row.charCodeAt(0) - 65) * 16 + idx) * 0.01}s` }}
                            >
                              <span className="seat-number">{number}</span>
                            </div>
                          );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resumen fijo en la parte inferior */}
              <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 shadow-2xl z-50">
                <div className="container mx-auto max-w-6xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="w-full md:flex-1">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Asientos seleccionados</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                        {selectedSeats.length > 0 ? (
                          selectedSeats.map(seat => (
                            <Badge 
                              key={seat} 
                              className="text-base md:text-lg px-4 py-1.5 whitespace-nowrap flex-shrink-0 bg-primary text-primary-foreground font-semibold"
                            >
                              🎟️ {seat}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">Ningún asiento seleccionado</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-center md:text-right flex-1 md:flex-initial">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                        <p className="text-2xl md:text-4xl font-bold text-foreground">
                          ${(selectedSeats.length * (showtime.price || 0)).toFixed(2)} <span className="text-lg text-muted-foreground">MXN</span>
                        </p>
                      </div>
                      <Button
                        onClick={handleConfirm}
                        disabled={selectedSeats.length === 0}
                        className="btn-cinema text-base md:text-lg px-6 md:px-8 py-4 md:py-6 h-auto"
                      >
                        Continuar →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SeatMap;
