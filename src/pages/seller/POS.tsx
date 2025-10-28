import { useState, useEffect } from "react";
import { Product, Showtime, Movie, Room, CartItem } from "@/types";
import { getProducts, getShowtimes, getMovies, getRooms, saveSale } from "@/utils/storage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";

const POS = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    setProducts(getProducts());
    setShowtimes(getShowtimes());
    setMovies(getMovies());
    setRooms(getRooms());
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addProduct = (product: Product) => {
    const existing = cart.find(item => item.type === "product" && item.productId === product.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
      setCart([...cart]);
    } else {
      setCart([...cart, {
        type: "product",
        name: product.name,
        price: product.price,
        quantity: 1,
        productId: product.id,
      }]);
    }
  };

  const addTicket = (showtime: Showtime) => {
    const movie = movies.find(m => m.id === showtime.movieId);
    const room = rooms.find(r => r.id === showtime.roomId);
    setCart([...cart, {
      type: "ticket",
      name: `${movie?.title} - ${room?.name} ${showtime.date} ${showtime.time}`,
      price: showtime.price,
      showtimeId: showtime.id,
    }]);
  };

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    const sale = {
      id: `sale_${Date.now()}`,
      sellerEmail: user?.email || "",
      items: cart,
      subtotal,
      tax,
      total,
      createdAt: new Date().toISOString(),
    };

    saveSale(sale);
    setCart([]);
    toast.success(`Venta completada: $${total.toFixed(2)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gradient-cinema">Punto de Venta</h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Products Search */}
            <Card className="card-cinema lg:col-span-2">
              <CardHeader>
                <CardTitle>Productos y Boletos</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar producto por nombre o SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-2">
                  {filteredProducts.slice(0, 20).map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 cursor-pointer"
                      onClick={() => addProduct(product)}
                    >
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${product.price}</p>
                        <Badge variant={product.stock > 20 ? "secondary" : "destructive"} className="text-xs">
                          Stock: {product.stock}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cart */}
            <Card className="card-cinema">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrito ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.type === "product" ? `x${item.quantity}` : "Boleto"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeItem(index)}
                          className="h-7 w-7"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (16%):</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full btn-cinema mt-4"
                  >
                    Cobrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default POS;
