import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import { getProducts, getCategories, saveProducts } from "@/utils/storage";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(getProducts());
    setCategories(getCategories());
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedProducts = products.map(p =>
      p.id === editingProduct.id ? editingProduct : p
    );
    
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    setIsOpen(false);
    setEditingProduct(null);
    toast.success("Producto actualizado");
  };

  const handleDelete = (id: number) => {
    const updatedProducts = products.filter(p => p.id !== id);
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    toast.success("Producto eliminado");
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || "Sin categoría";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gradient-cinema">Administrar Productos</h1>

          <Card className="card-cinema mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="card-cinema">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">SKU</p>
                      <p className="font-semibold">{product.sku}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">Nombre</p>
                      <p className="font-semibold">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Categoría</p>
                      <Badge variant="secondary">{getCategoryName(product.categoryId)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Precio</p>
                        <p className="font-semibold text-primary">${product.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stock</p>
                        <Badge variant={product.stock > 20 ? "secondary" : "destructive"}>
                          {product.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog open={isOpen && editingProduct?.id === product.id} onOpenChange={setIsOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Producto</DialogTitle>
                          <DialogDescription>
                            Modifica los datos del producto
                          </DialogDescription>
                        </DialogHeader>
                        
                        {editingProduct && (
                          <form onSubmit={handleSave} className="space-y-4">
                            <div>
                              <Label>Nombre</Label>
                              <Input
                                value={editingProduct.name}
                                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label>Precio</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                                required
                              />
                            </div>
                            <div>
                              <Label>Stock</Label>
                              <Input
                                type="number"
                                value={editingProduct.stock}
                                onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                                required
                              />
                            </div>
                            <div>
                              <Label>Categoría</Label>
                              <Select
                                value={editingProduct.categoryId.toString()}
                                onValueChange={(v) => setEditingProduct({...editingProduct, categoryId: parseInt(v)})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button type="submit" className="w-full btn-cinema">
                              Guardar cambios
                            </Button>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
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

export default ProductsAdmin;
