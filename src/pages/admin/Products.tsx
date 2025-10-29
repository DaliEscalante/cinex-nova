import { useState, useEffect, useRef } from "react";
import { Product, Category } from "@/types";
import { getProducts, getCategories, saveProducts } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Search, Plus, Upload } from "lucide-react";
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
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Validaciones
    if (!editingProduct.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (editingProduct.price <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }
    if (editingProduct.stock < 0) {
      toast.error("El stock no puede ser negativo");
      return;
    }

    if (isCreating) {
      const newProduct = {
        ...editingProduct,
        id: Math.max(...products.map(p => p.id), 0) + 1,
      };
      const updatedProducts = [...products, newProduct];
      saveProducts(updatedProducts);
      setProducts(updatedProducts);
      toast.success("Producto creado");
    } else {
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id ? editingProduct : p
      );
      saveProducts(updatedProducts);
      setProducts(updatedProducts);
      toast.success("Producto actualizado");
    }
    
    setIsOpen(false);
    setEditingProduct(null);
    setIsCreating(false);
  };

  const handleDelete = (id: number) => {
    const updatedProducts = products.filter(p => p.id !== id);
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    toast.success("Producto eliminado");
  };

  const handleCreateNew = () => {
    setEditingProduct({
      id: 0,
      sku: `SKU${Date.now()}`,
      name: "",
      price: 0,
      stock: 0,
      categoryId: 1,
    });
    setIsCreating(true);
    setIsOpen(true);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error("El archivo CSV debe tener al menos una línea de encabezado y una de datos");
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['sku', 'name', 'price', 'stock', 'categoryid'];
        
        if (!requiredHeaders.every(h => headers.includes(h))) {
          toast.error("El CSV debe incluir las columnas: SKU, Name, Price, Stock, CategoryId");
          return;
        }

        const newProducts: Product[] = [];
        const existingSKUs = new Set(products.map(p => p.sku));
        let duplicates = 0;
        let errors = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const sku = values[headers.indexOf('sku')];
          const name = values[headers.indexOf('name')];
          const price = parseFloat(values[headers.indexOf('price')]);
          const stock = parseInt(values[headers.indexOf('stock')]);
          const categoryId = parseInt(values[headers.indexOf('categoryid')]);

          // Validaciones
          if (existingSKUs.has(sku)) {
            duplicates++;
            continue;
          }
          
          if (!name || price <= 0 || stock < 0 || !categoryId) {
            errors++;
            continue;
          }

          newProducts.push({
            id: Math.max(...products.map(p => p.id), 0) + newProducts.length + 1,
            sku,
            name,
            price,
            stock,
            categoryId,
          });
          existingSKUs.add(sku);
        }

        if (newProducts.length > 0) {
          const updatedProducts = [...products, ...newProducts];
          saveProducts(updatedProducts);
          setProducts(updatedProducts);
          toast.success(
            `Carga completada: ${newProducts.length} productos importados. ${duplicates > 0 ? `${duplicates} duplicados ignorados. ` : ''}${errors > 0 ? `${errors} con errores.` : ''}`
          );
        } else {
          toast.error("No se pudo importar ningún producto");
        }
      } catch (error) {
        toast.error("Error al procesar el archivo CSV");
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadCSVTemplate = () => {
    const template = "SKU,Name,Price,Stock,CategoryId\nSKU001,Ejemplo Producto,50.00,100,1\n";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Plantilla descargada");
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || "Sin categoría";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gradient-cinema">Administrar Productos</h1>
            <div className="flex gap-2">
              <Button onClick={downloadCSVTemplate} variant="outline">
                Descargar plantilla CSV
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Cargar CSV
              </Button>
              <Button onClick={handleCreateNew} className="btn-cinema">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>
          </div>

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
                          onClick={() => {
                            setEditingProduct(product);
                            setIsCreating(false);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
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

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isCreating ? "Crear Producto" : "Editar Producto"}</DialogTitle>
                <DialogDescription>
                  {isCreating ? "Ingresa los datos del nuevo producto" : "Modifica los datos del producto"}
                </DialogDescription>
              </DialogHeader>
              
              {editingProduct && (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <Label>SKU *</Label>
                    <Input
                      value={editingProduct.sku}
                      onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                      required
                      disabled={!isCreating}
                    />
                  </div>
                  <div>
                    <Label>Nombre *</Label>
                    <Input
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Precio * (debe ser mayor a 0)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Stock * (no puede ser negativo)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Categoría *</Label>
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
                    {isCreating ? "Crear Producto" : "Guardar Cambios"}
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

export default ProductsAdmin;
