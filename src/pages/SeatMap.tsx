import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const vipOnly = searchParams.get("vipOnly") === "true";

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

    // Si es sala VIP only, solo permitir seleccionar asientos VIP
    if (vipOnly && seat.status !== "vip") {
      toast.error("Solo puedes seleccionar asientos VIP en esta función");
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
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {movie && showtime && room && (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2 text-gradient-cinema">{movie.title}</h1>
                <p className="text-muted-foreground">
                  {room.name} - {showtime.date} {showtime.time} - ${showtime.price}
                </p>
                {vipOnly && (
                  <Alert className="mt-4 max-w-2xl mx-auto border-accent">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    <AlertDescription className="text-accent">
                      Esta es una función VIP. Solo puedes seleccionar asientos VIP (color morado).
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Card className="card-cinema mb-6">
                <CardContent className="p-8">
                  <div className="flex justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="seat seat-available" />
                      <span className="text-sm">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="seat seat-selected" />
                      <span className="text-sm">Seleccionado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="seat seat-vip" />
                      <span className="text-sm">VIP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="seat seat-reserved" />
                      <span className="text-sm">Reservado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="seat seat-sold" />
                      <span className="text-sm">Vendido</span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="h-2 bg-primary/20 rounded-full mb-2" />
                    <p className="text-center text-sm text-muted-foreground">PANTALLA</p>
                  </div>

                  <div className="space-y-3">
                    {rows.map(row => (
                      <div key={row} className="flex items-center justify-center gap-2">
                        <span className="w-8 text-center font-semibold text-muted-foreground">
                          {row}
                        </span>
                        {[...Array(16)].map((_, idx) => {
                          const number = idx + 1;
                          const seat = seats.find(s => s.row === row && s.number === number);
                          const seatId = `${row}${number}`;
                          const isSelected = selectedSeats.includes(seatId);
                          
                          let seatClass = "seat ";
                          if (isSelected) seatClass += "seat-selected";
                          else if (seat?.status === "vip") seatClass += "seat-vip";
                          else if (seat?.status === "reserved") seatClass += "seat-reserved";
                          else if (seat?.status === "sold") seatClass += "seat-sold";
                          else seatClass += "seat-available";

                          return (
                            <div
                              key={number}
                              className={seatClass}
                              onClick={() => toggleSeat(row, number)}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Asientos seleccionados</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map(seat => (
                        <Badge key={seat} variant="secondary" className="text-lg px-3 py-1">
                          {seat}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Ninguno</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold text-gradient-cinema">
                    ${(selectedSeats.length * (showtime.price || 0)).toFixed(2)}
                  </p>
                  <Button
                    onClick={handleConfirm}
                    disabled={selectedSeats.length === 0}
                    className="mt-2 btn-cinema"
                  >
                    Confirmar selección
                  </Button>
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
