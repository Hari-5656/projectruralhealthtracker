import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, PrinterCheck, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@shared/schema";

interface QRCodeGeneratorProps {
  patient: Patient;
  size?: number;
}

export function QRCodeGenerator({ patient, size = 200 }: QRCodeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Generate SVG QR code (simplified representation)
  const generateQRCodeSVG = (data: string, size: number) => {
    // This is a simplified QR code representation
    // In a real implementation, you would use a proper QR code library
    const gridSize = 25;
    const cellSize = size / gridSize;
    
    // Create a simple pattern based on the data
    const pattern = [];
    for (let i = 0; i < gridSize; i++) {
      pattern[i] = [];
      for (let j = 0; j < gridSize; j++) {
        // Simple hash-based pattern generation
        const hash = (data.charCodeAt((i * gridSize + j) % data.length) + i + j) % 3;
        pattern[i][j] = hash > 0;
      }
    }

    // Generate SVG
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="white"/>`;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (pattern[i][j]) {
          svg += `<rect x="${j * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
        }
      }
    }
    
    svg += `</svg>`;
    return svg;
  };

  const qrData = JSON.stringify({
    id: patient.patientId,
    name: patient.name,
    qr: patient.qrCode,
  });

  const qrCodeSVG = generateQRCodeSVG(qrData, size);

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      const blob = new Blob([qrCodeSVG], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${patient.patientId}-qr-code.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "QR code downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${patient.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container { 
                border: 2px solid #000; 
                padding: 20px; 
                display: inline-block; 
                margin: 20px;
              }
              .patient-info {
                margin-top: 10px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Rural Health Card</h2>
              ${qrCodeSVG}
              <div class="patient-info">
                <strong>${patient.name}</strong><br/>
                ID: ${patient.patientId}<br/>
                ${patient.ageGroup ? `Age Group: ${patient.ageGroup}` : ''}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyCode = () => {
    if (patient.qrCode) {
      navigator.clipboard.writeText(patient.qrCode);
      toast({
        title: "Copied",
        description: "QR code data copied to clipboard",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Digital Health Card</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {/* Patient Info */}
        <div className="space-y-2">
          <h3 className="font-medium text-lg">{patient.name}</h3>
          <div className="flex justify-center space-x-2">
            <Badge variant="outline">ID: {patient.patientId}</Badge>
            <Badge className="bg-medical-blue text-white capitalize">
              {patient.ageGroup}
            </Badge>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex justify-center">
          <div 
            className="border-2 border-gray-300 p-4 rounded-lg bg-white"
            dangerouslySetInnerHTML={{ __html: qrCodeSVG }}
          />
        </div>

        {/* QR Code Info */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>Scan this QR code to access patient records</p>
          <p className="text-xs">Code: {patient.qrCode}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="bg-medical-blue hover:bg-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
          >
            <PrinterCheck className="mr-2 h-4 w-4" />
            PrinterCheck
          </Button>
          <Button
            onClick={handleCopyCode}
            variant="outline"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-3 text-sm text-left">
          <h4 className="font-medium text-medical-blue mb-2">Usage Instructions:</h4>
          <ul className="text-gray-700 space-y-1 text-xs">
            <li>• PrinterCheck and laminate for durability</li>
            <li>• Attach to patient's health booklet</li>
            <li>• Scan during health visits for quick access</li>
            <li>• Keep QR code clean and unfolded</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
