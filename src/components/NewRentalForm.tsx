import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { Customer, Rental } from '../types';
import { Button, Input, Select } from './ui';

interface NewRentalFormProps {
    onSave: () => void;
    onCancel: () => void;
}

const getFormattedCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const NewRentalForm: React.FC<NewRentalFormProps> = ({ onSave, onCancel }) => {
    const { vehicles, customers, rentals, addCustomer, addRental, addToast } = useData();
    
    const [customerType, setCustomerType] = useState<'new' | 'existing'>('new');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [customer, setCustomer] = useState<Omit<Customer, 'id' | 'created_at'>>({
        first_name: '', last_name: '', email: '', phone: '', id_card_number: '', drivers_license_number: ''
    });
    const [vehicleId, setVehicleId] = useState<string>('');
    const [startDate, setStartDate] = useState(getFormattedCurrentDateTime());
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    
    useEffect(() => {
        if (customerType === 'existing' && selectedCustomerId) {
            const existingCustomer = customers.find(c => c.id === selectedCustomerId);
            if (existingCustomer) {
                const { id, created_at, ...customerData } = existingCustomer;
                setCustomer(customerData);
            }
        } else {
            setCustomer({ first_name: '', last_name: '', email: '', phone: '', id_card_number: '', drivers_license_number: '' });
        }
    }, [customerType, selectedCustomerId, customers]);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const unavailableVehicleIds = useMemo(() => {
        if (!startDate || !endDate) return new Set();
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) return new Set(vehicles.map(v => v.id));

        const unavailable = rentals.filter(rental => {
            const rentalStart = new Date(rental.start_date);
            const rentalEnd = new Date(rental.end_date);
            return start < rentalEnd && end > rentalStart;
        }).map(rental => rental.vehicle_id);
        
        return new Set(unavailable);
    }, [startDate, endDate, rentals, vehicles]);

    useEffect(() => {
        if (vehicleId && unavailableVehicleIds.has(vehicleId)) {
            setVehicleId('');
        }
    }, [unavailableVehicleIds, vehicleId]);

    const isFormValid = useMemo(() => {
        const customerDetailsValid = customerType === 'existing'
            ? !!selectedCustomerId
            : customer.first_name && customer.last_name && customer.email && customer.phone &&
              customer.id_card_number && customer.drivers_license_number;

        return (
            customerDetailsValid && vehicleId &&
            startDate && endDate && new Date(startDate) < new Date(endDate)
        );
    }, [customer, vehicleId, startDate, endDate, customerType, selectedCustomerId]);

    useEffect(() => {
        if (!vehicleId || !startDate || !endDate) {
            setTotalPrice(0);
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            setTotalPrice(0);
            return;
        }

        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;

        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        let price = 0;
        if (durationHours <= 4) {
            price = vehicle.pricing['4h'];
        } else if (durationHours <= 6) {
            price = vehicle.pricing['6h'];
        } else if (durationHours <= 12) {
            price = vehicle.pricing['12h'];
        } else if (durationHours <= 24) {
            price = vehicle.pricing['24h'];
        } else {
            const durationDays = Math.ceil(durationHours / 24);
            price = durationDays * vehicle.pricing.daily;
        }
        setTotalPrice(price);

    }, [vehicleId, startDate, endDate, vehicles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            addToast("Prosím, vyplňte všechna pole správně.", 'error');
            return;
        };
        
        setIsSubmitting(true);
        try {
            let customerIdToUse: string;

            if (customerType === 'new') {
                const newCustomer = await addCustomer(customer);
                if (!newCustomer) throw new Error("Failed to create customer");
                customerIdToUse = newCustomer.id;
            } else {
                customerIdToUse = selectedCustomerId;
            }

            const newRental: Omit<Rental, 'id' | 'created_at'> = {
                customer_id: customerIdToUse,
                vehicle_id: vehicleId,
                start_date: startDate,
                end_date: endDate,
                total_price: totalPrice,
                status: new Date(startDate) > new Date() ? 'upcoming' : 'active',
            };

            await addRental(newRental);
            addToast("Rezervace byla úspěšně vytvořena.", "success");
            onSave();
        } catch(error) {
            // Toast is handled in context
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">Údaje o zákazníkovi</h3>
                <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setCustomerType('new')} className={`px-4 py-2 text-sm rounded-md transition-colors ${customerType === 'new' ? 'bg-accent text-white' : 'bg-gray-700 text-text-secondary hover:bg-gray-600'}`}>Nový zákazník</button>
                    <button type="button" onClick={() => setCustomerType('existing')} className={`px-4 py-2 text-sm rounded-md transition-colors ${customerType === 'existing' ? 'bg-accent text-white' : 'bg-gray-700 text-text-secondary hover:bg-gray-600'}`}>Stávající zákazník</button>
                </div>

                {customerType === 'new' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Jméno" name="first_name" value={customer.first_name} onChange={handleCustomerChange} required />
                        <Input label="Příjmení" name="last_name" value={customer.last_name} onChange={handleCustomerChange} required />
                        <Input label="Email" name="email" type="email" value={customer.email} onChange={handleCustomerChange} required />
                        <Input label="Telefon" name="phone" type="tel" value={customer.phone || ''} onChange={handleCustomerChange} required />
                        <Input label="Číslo OP" name="id_card_number" value={customer.id_card_number || ''} onChange={handleCustomerChange} required />
                        <Input label="Číslo ŘP" name="drivers_license_number" value={customer.drivers_license_number || ''} onChange={handleCustomerChange} required />
                    </div>
                ) : (
                    <div>
                        <Select label="Vyberte zákazníka" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} required>
                            <option value="">-- Vyberte --</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>)}
                        </Select>
                    </div>
                )}
            </div>
            <div className="pt-4 border-t border-gray-700">
                 <h3 className="text-lg font-semibold text-text-primary mb-2">Údaje o pronájmu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <Select label="Vozidlo" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
                         <option value="">-- Vyberte vozidlo --</option>
                        {vehicles.map(v => {
                            const isUnavailable = unavailableVehicleIds.has(v.id);
                            return <option key={v.id} value={v.id} disabled={isUnavailable}>
                                {v.brand} - {v.license_plate} {isUnavailable ? '(Obsazeno)' : ''}
                            </option>
                        })}
                    </Select>
                    <Input label="Začátek pronájmu" type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                    <Input label="Konec pronájmu" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                    <Input
                        label="Celková cena (Kč)"
                        type="number"
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(Number(e.target.value))}
                        required
                    />
                </div>
            </div>
             <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Zrušit</Button>
                <Button type="submit" disabled={!isFormValid || isSubmitting}>{isSubmitting ? 'Ukládání...' : 'Vytvořit rezervaci a smlouvu'}</Button>
            </div>
        </form>
    );
};

export default NewRentalForm;
