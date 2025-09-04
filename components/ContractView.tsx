
import React, { useState, useRef } from 'react';
import { Modal, Button } from './ui';
import type { Rental, Vehicle, Customer } from '../types';
import { PrinterIcon, PenToolIcon, QrCodeIcon } from './Icons';
import SignaturePad, { SignaturePadRef } from './SignaturePad';
import { useData } from '../context/DataContext';

interface ContractViewProps {
  rental: Rental;
  vehicle: Vehicle;
  customer: Customer;
  onClose: () => void;
}

const ContractView: React.FC<ContractViewProps> = ({ rental, vehicle, customer, onClose }) => {
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const signaturePadRef = useRef<SignaturePadRef>(null);
    const contractContentRef = useRef<HTMLDivElement>(null);
    const { bankAccountNumber, addToast } = useData();

    const handleClearSignature = () => {
        signaturePadRef.current?.clear();
    };

    const handleConfirmSignature = () => {
        const signature = signaturePadRef.current?.getSignature();
        if (signature) {
            setSignatureDataUrl(signature);
        } else {
            addToast("Podpis je prázdný.", 'error');
        }
    };
    
    const createEmailBody = () => {
        if (!contractContentRef.current) return '';
        
        const contentClone = contractContentRef.current.cloneNode(true) as HTMLElement;

        const signatureBlock = contentClone.querySelector('.signature-block');
        
        if (signatureBlock && signatureDataUrl) {
            signatureBlock.innerHTML = `
                <div style="background-color: #f0f0f0; border: 1px dashed #ccc; padding: 10px; text-align: center; border-radius: 4px; margin-top: 10px;">
                    <p style="margin: 0; font-weight: bold; color: #333;">[ Digitálně podepsáno ]</p>
                </div>
                <p style="border-top: 2px dotted #999; width: 100%; text-align: center; margin-top: 4px; padding-top: 4px;">Podpis nájemce</p>
            `;
        }

        const contractHtml = contentClone.innerHTML;
        const title = `Smlouva o pronájmu vozidla ${vehicle.brand} (${vehicle.licensePlate})`;

        return `
            <!DOCTYPE html>
            <html lang="cs">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
                    .container { max-width: 800px; margin: 0 auto; background-color: #fff; border: 1px solid #ddd; padding: 30px; border-radius: 8px; }
                    h2, h3 { color: #000; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; }
                    p { margin: 0 0 10px; }
                    strong { font-weight: 600; }
                </style>
            </head>
            <body>
                <div class="container">
                    ${contractHtml}
                </div>
            </body>
            </html>
        `;
    };

    const handleSendEmail = () => {
        if (!signatureDataUrl) {
            addToast("Smlouva musí být podepsána před odesláním.", 'error');
            return;
        }
        const subject = `Smlouva o pronájmu vozidla ${vehicle.brand} (${vehicle.licensePlate})`;
        const body = createEmailBody();
        const mailtoLink = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.open(mailtoLink, '_self');
    };
    
    const handlePrint = () => {
        if (!signatureDataUrl) {
            addToast("Smlouva musí být podepsána před tiskem.", 'error');
            return;
        }
        const printContent = contractContentRef.current;
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
        if (printWindow && printContent) {
            printWindow.document.write('<html><head><title>Smlouva o pronájmu</title>');
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
            printWindow.document.write('</head><body class="bg-white text-black p-8">');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }

    const generateQrCodeUrl = () => {
        if (!bankAccountNumber) return '';
        
        // Remove spaces from IBAN to ensure compatibility
        const cleanBankAccountNumber = bankAccountNumber.replace(/\s/g, '');
        
        // Correct SPAYD format with colons separating keys and values
        const spaydString = `SPD*1.0*ACC:${cleanBankAccountNumber}*AM:${rental.totalPrice.toFixed(2)}*CC:CZK*X-VS:${rental.id.replace(/\D/g, '').slice(0, 10)}*MSG:PRONAJEM-${vehicle.licensePlate}`;
        
        // The final payload needs to be URL encoded for the QR code generation API
        const encodedSpayd = encodeURIComponent(spaydString);
        
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedSpayd}`;
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Smlouva o pronájmu #${rental.id.slice(0, 5)}`}>
            <div id="contract-content" ref={contractContentRef} className="prose prose-invert max-w-none prose-sm text-text-secondary">
                <h2 className="text-center text-xl font-bold text-text-primary">Smlouva o nájmu dopravního prostředku</h2>
                
                <h3 className="text-lg font-semibold text-text-primary mt-4">1. Smluvní strany</h3>
                <p><strong>Pronajímatel:</strong> Milan Gula, Ghegova 1019/1, Nové sady, Brno, 60200, IČO: 07031653</p>
                <p><strong>Nájemce:</strong> {customer.firstName} {customer.lastName}, Tel: {customer.phone}, Email: {customer.email}</p>
                <p>Číslo OP: {customer.idCardNumber}, Číslo ŘP: {customer.driversLicenseNumber}</p>
                
                <h3 className="text-lg font-semibold text-text-primary mt-4">2. Předmět nájmu</h3>
                <p><strong>Vozidlo:</strong> {vehicle.brand}</p>
                <p><strong>SPZ:</strong> {vehicle.licensePlate}</p>
                <p><strong>VIN:</strong> {vehicle.vin}</p>
                
                <h3 className="text-lg font-semibold text-text-primary mt-4">3. Doba nájmu a cena</h3>
                <p><strong>Začátek nájmu:</strong> {new Date(rental.startDate).toLocaleString('cs-CZ')}</p>
                <p><strong>Konec nájmu:</strong> {new Date(rental.endDate).toLocaleString('cs-CZ')}</p>
                <p><strong>Celková cena:</strong> {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(rental.totalPrice)}</p>

                <h3 className="text-lg font-semibold text-text-primary mt-4">4. Práva a povinnosti</h3>
                <p>Nájemce se zavazuje používat vozidlo s péčí řádného hospodáře. Vozidlo nesmí být použito k páchání trestné činnosti. Nájemce je plně odpovědný za veškeré pokuty a sankce vzniklé během doby pronájmu.</p>

                <h3 className="text-lg font-semibold text-text-primary mt-4">5. Spoluúčast a pojištění</h3>
                <p>Vozidlo je havarijně pojištěno. V případě zaviněné nehody nebo poškození vozidla nájemcem je spoluúčast stanovena na <strong>5.000 Kč - 10.000 Kč</strong> podle rozsahu poškození.</p>

                <h3 className="text-lg font-semibold text-text-primary mt-4">6. Závěrečná ustanovení</h3>
                <p>Tato smlouva je vyhotovena ve dvou exemplářích, z nichž každá strana obdrží jeden. Nájemce svým podpisem stvrzuje, že se seznámil s podmínkami a souhlasí s nimi.</p>
                
                <div className="flex justify-between items-end mt-8 pt-8 border-t border-gray-600">
                    <div className="text-center">
                         <p className="font-serif italic text-xl text-text-primary h-16 flex items-center justify-center">Milan Gula</p>
                        <p className="border-t-2 border-dotted border-gray-500 w-48 pt-1">Podpis pronajímatele</p>
                    </div>
                    <div className="signature-block">
                        {signatureDataUrl ? (
                            <div className="text-center">
                                <img src={signatureDataUrl} alt="Podpis zákazníka" className="h-16 w-auto bg-gray-200 p-1 rounded-md inline-block" />
                                <p className="border-t-2 border-dotted border-gray-500 w-48 text-center mt-1 pt-1">Podpis nájemce</p>
                            </div>
                        ) : (
                             <div>
                                <p className="text-sm text-accent mb-2 flex items-center"><PenToolIcon className="w-4 h-4 mr-2" /> Prosím, podepište se níže:</p>
                                <SignaturePad ref={signaturePadRef} />
                                <div className="flex gap-2 mt-2 justify-end">
                                    <Button type="button" variant="secondary" onClick={handleClearSignature}>Vymazat</Button>
                                    <Button type="button" onClick={handleConfirmSignature}>Potvrdit podpis</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap justify-end gap-4 mt-6 pt-6 border-t border-gray-700">
                <Button variant="secondary" onClick={onClose}>Zavřít</Button>
                <Button onClick={handlePrint} disabled={!signatureDataUrl}>
                    <PrinterIcon className="w-5 h-5 mr-2" />
                    Tisk
                </Button>
                <Button onClick={handleSendEmail} disabled={!signatureDataUrl}>Odeslat na email</Button>
                <Button onClick={() => setIsQrModalOpen(true)} disabled={!bankAccountNumber}>
                    <QrCodeIcon className="w-5 h-5 mr-2" />
                    Zaplatit QR
                </Button>
            </div>

            {isQrModalOpen && (
                <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="QR Platba">
                    <div className="flex flex-col items-center justify-center text-center">
                        <img src={generateQrCodeUrl()} alt="QR kód pro platbu" className="rounded-lg mb-4"/>
                        <h3 className="text-lg font-semibold">Naskenujte kód v bankovní aplikaci</h3>
                        <div className="mt-4 text-left bg-gray-900 p-4 rounded-lg">
                            <p><strong>Částka:</strong> {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(rental.totalPrice)}</p>
                            <p><strong>Číslo účtu (IBAN):</strong> {bankAccountNumber}</p>
                            <p><strong>Variabilní symbol:</strong> {rental.id.replace(/\D/g, '').slice(0, 10)}</p>
                        </div>
                        <Button variant="secondary" onClick={() => setIsQrModalOpen(false)} className="mt-6">
                            Zavřít
                        </Button>
                    </div>
                </Modal>
            )}
        </Modal>
    );
};

export default ContractView;
