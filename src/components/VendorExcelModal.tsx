import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useRaffle } from '../context/RaffleContext';
import { generateId } from '../utils/helpers';
import { Vendor } from '../types';
import { 
  validateVendorForm, 
  validateId, 
  sanitizeFormData, 
  checkRateLimit,
  escapeHtml 
} from '../utils/validation';

interface VendorExcelModalProps {
  raffleId: string;
  onClose: () => void;
  numbersPerVendor: number;
  raffleName: string;
  maxVendors: number;
  currentVendorsCount: number;
}

interface VendorData {
  nombre: string;
  email: string;
  telefono: string;
}

const VendorExcelModal = ({ 
  raffleId, 
  onClose, 
  numbersPerVendor, 
  raffleName, 
  maxVendors, 
  currentVendorsCount 
}: VendorExcelModalProps) => {
  const { addVendor } = useRaffle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState<VendorData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Función para descargar plantilla Excel
  const downloadTemplate = () => {
    const templateData = [
      {
        nombre: 'Juan Pérez',
        email: 'juan.perez@email.com',
        telefono: '+56912345678'
      },
      {
        nombre: 'María González',
        email: 'maria.gonzalez@email.com',
        telefono: '+56987654321'
      },
      {
        nombre: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        telefono: '+56911223344'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    
    // Configurar ancho de columnas
    worksheet['!cols'] = [
      { width: 20 }, // nombre
      { width: 25 }, // email
      { width: 15 }  // telefono
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendedores');
    XLSX.writeFile(workbook, `plantilla_vendedores_${raffleName.replace(/\s+/g, '_')}.xlsx`);
  };

  // Función para procesar archivo Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Validar estructura del archivo
        if (jsonData.length === 0) {
          throw new Error('El archivo está vacío');
        }

        // Validar columnas requeridas
        const requiredColumns = ['nombre', 'email', 'telefono'];
        const firstRow = jsonData[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
          throw new Error(`Faltan las siguientes columnas: ${missingColumns.join(', ')}`);
        }

        // Validar límite de vendedores
        const availableSlots = maxVendors - currentVendorsCount;
        if (jsonData.length > availableSlots) {
          throw new Error(`Solo puedes agregar ${availableSlots} vendedores más. El archivo contiene ${jsonData.length} vendedores.`);
        }

        // Procesar y validar datos
        const processedData: VendorData[] = [];
        const errors: string[] = [];

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // +2 porque Excel empieza en 1 y hay header
          
          // Sanitizar datos de entrada
          const sanitizedRow = {
            nombre: escapeHtml(row.nombre?.toString().trim() || ''),
            email: escapeHtml(row.email?.toString().trim().toLowerCase() || ''),
            telefono: escapeHtml(row.telefono?.toString().trim() || '')
          };

          // Mapear los campos para que coincidan con la validación
          const vendorForValidation = {
            name: sanitizedRow.nombre,
            email: sanitizedRow.email,
            phone: sanitizedRow.telefono
          };
          
          // Validar usando las funciones centralizadas
          const vendorValidation = validateVendorForm(vendorForValidation);
          if (!vendorValidation.isValid) {
            errors.push(`Fila ${rowNumber}: ${vendorValidation.error}`);
            return;
          }

          processedData.push({
            nombre: sanitizedRow.nombre,
            email: sanitizedRow.email,
            telefono: sanitizedRow.telefono
          });
        });

        if (errors.length > 0) {
          throw new Error(`Errores encontrados:\n${errors.join('\n')}`);
        }

        // Verificar emails duplicados
        const emails = processedData.map(v => v.email);
        const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
        if (duplicateEmails.length > 0) {
          throw new Error(`Emails duplicados encontrados: ${duplicateEmails.join(', ')}`);
        }

        setPreviewData(processedData);
        setShowPreview(true);
        setIsLoading(false);

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al procesar el archivo');
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Función para confirmar y guardar vendedores
  const confirmAndSaveVendors = () => {
    // Prevenir múltiples envíos
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    // Rate limiting - prevenir spam de creación masiva
    const clientId = `vendor-excel-${raffleId}-${Date.now()}`;
    if (!checkRateLimit(clientId, 1, 30000)) {
      setError('Demasiados intentos de carga masiva. Por favor, espera un momento.');
      setIsLoading(false);
      return;
    }

    // Validar ID de rifa
    const raffleIdValidation = validateId(raffleId, 'ID de rifa');
    if (!raffleIdValidation.isValid) {
      setError(raffleIdValidation.error || 'ID de rifa inválido');
      setIsLoading(false);
      return;
    }

    try {
      let successCount = 0;
      
      previewData.forEach(vendorData => {
        // Sanitizar datos una vez más antes de guardar
        const sanitizedVendorData = sanitizeFormData({
          name: vendorData.nombre,
          email: vendorData.email,
          phone: vendorData.telefono
        });

        const vendorId = generateId();
        const vendorLink = `${window.location.origin}/sell/${raffleId}/${vendorId}`;
        
        const newVendor: Vendor = {
          id: vendorId,
          raffleId,
          name: sanitizedVendorData.name || '',
          email: sanitizedVendorData.email || '',
          phone: sanitizedVendorData.phone || '',
          salesCount: 0,
          link: vendorLink,

        };

        addVendor(newVendor);
        successCount++;
      });

      setSuccess(`¡${successCount} vendedores agregados exitosamente!`);
      setShowPreview(false);
      setPreviewData([]);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setError('Error al guardar los vendedores');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPreviewData([]);
    setShowPreview(false);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-file-earmark-excel me-2"></i>
              Gestión Masiva de Vendedores
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error}</pre>
              </div>
            )}
            
            {success && (
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>
                {success}
              </div>
            )}

            {!showPreview && !success && (
              <>
                <div className="alert alert-info">
                  <h6><i className="bi bi-info-circle me-2"></i>Instrucciones:</h6>
                  <ol className="mb-0">
                    <li>Descarga la plantilla Excel haciendo clic en el botón de abajo</li>
                    <li>Completa la información de los vendedores en el archivo</li>
                    <li>Sube el archivo completado para agregar todos los vendedores</li>
                  </ol>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <i className="bi bi-download display-4 text-primary mb-3"></i>
                        <h6>Paso 1: Descargar Plantilla</h6>
                        <p className="text-muted small">
                          Descarga el archivo Excel con el formato correcto
                        </p>
                        <button
                          className="btn btn-outline-primary"
                          onClick={downloadTemplate}
                        >
                          <i className="bi bi-download me-2"></i>
                          Descargar Plantilla
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <i className="bi bi-upload display-4 text-success mb-3"></i>
                        <h6>Paso 2: Subir Archivo</h6>
                        <p className="text-muted small">
                          Sube el archivo Excel completado
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".xlsx,.xls"
                          onChange={handleFileUpload}
                          className="form-control"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-warning">
                  <strong>Límites:</strong> Puedes agregar máximo {maxVendors - currentVendorsCount} vendedores más.
                  <br />
                  <strong>Formato requerido:</strong> El archivo debe tener las columnas: nombre, email, telefono
                </div>
              </>
            )}

            {showPreview && (
              <>
                <div className="alert alert-success">
                  <h6><i className="bi bi-check-circle me-2"></i>Vista Previa</h6>
                  Se encontraron {previewData.length} vendedores válidos. Revisa la información antes de confirmar.
                </div>

                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table table-sm table-striped">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((vendor, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{vendor.nombre}</td>
                          <td>{vendor.email}</td>
                          <td>{vendor.telefono}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-success flex-fill"
                    onClick={confirmAndSaveVendors}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Confirmar y Guardar ({previewData.length} vendedores)
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                    disabled={isLoading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver
                  </button>
                </div>
              </>
            )}

            {isLoading && !showPreview && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Procesando...</span>
                </div>
                <p className="mt-2 text-muted">Procesando archivo...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorExcelModal;