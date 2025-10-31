import { useRef } from "react";
import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, X } from "lucide-react";
import { toast } from "sonner";

interface TicketProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  saleId: string;
  onClose: () => void;
}

const Ticket = ({ items, subtotal, tax, total, saleId, onClose }: TicketProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = ticketRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=800,width=600');
    if (!printWindow) {
      toast.error("No se pudo abrir la ventana de impresión");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket - ${saleId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px;
              background: white;
            }
            .ticket {
              max-width: 300px;
              margin: 0 auto;
              border: 2px dashed #333;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #333;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              background: linear-gradient(135deg, #e91e63, #9c27b0, #ffc107);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .info {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px dashed #999;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 11px;
            }
            .items {
              margin-bottom: 20px;
            }
            .item {
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px dotted #ccc;
            }
            .item-name {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            .item-details {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #666;
            }
            .totals {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #333;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              font-size: 12px;
            }
            .total-row.final {
              font-size: 16px;
              font-weight: bold;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px double #333;
            }
            .qr-code {
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .qr-code img {
              width: 120px;
              height: 120px;
              margin: 0 auto;
            }
            .qr-text {
              font-size: 10px;
              color: #666;
              margin-top: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px dashed #999;
              font-size: 10px;
              color: #666;
            }
            .thank-you {
              font-size: 14px;
              font-weight: bold;
              color: #e91e63;
              margin: 10px 0;
            }
            @media print {
              body { padding: 0; }
              .ticket { border: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
      <Card className="card-cinema max-w-md w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gradient-cinema">¡Compra Exitosa!</h2>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div ref={ticketRef}>
            <div className="ticket">
              <div className="header">
                <div className="logo">★ STARLIGHT ★</div>
                <div className="subtitle">Cinema Experience</div>
              </div>

              <div className="info">
                <div className="info-row">
                  <span>Folio:</span>
                  <span><strong>{saleId}</strong></span>
                </div>
                <div className="info-row">
                  <span>Fecha:</span>
                  <span>{formatDate()}</span>
                </div>
              </div>

              <div className="items">
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
                  DETALLE DE COMPRA
                </div>
                {items.map((item, index) => (
                  <div key={index} className="item">
                    <div className="item-name">{item.name}</div>
                    <div className="item-details">
                      <span>
                        {item.type === "ticket" ? "Boleto" : `Producto x${item.quantity || 1}`}
                      </span>
                      <span>${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>IVA (16%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="total-row final">
                  <span>TOTAL:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="qr-code">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(saleId)}`}
                  alt="QR Code"
                />
                <div className="qr-text">Código QR de validación</div>
              </div>

              <div className="footer">
                <div className="thank-you">¡GRACIAS POR TU COMPRA!</div>
                <p>Presenta este ticket en tu llegada</p>
                <p style={{ marginTop: '5px' }}>www.starlightcinema.com</p>
              </div>
            </div>
          </div>

          <Button onClick={handlePrint} className="w-full btn-cinema mt-6" size="lg">
            <Printer className="w-5 h-5 mr-2" />
            Imprimir Ticket
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Ticket;
