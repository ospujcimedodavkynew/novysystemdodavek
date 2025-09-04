
import React, { useState } from 'react';
import type { Rental, Vehicle, Customer } from '../types';
import { Card, Button } from './ui';
import ContractView from './ContractView';
import { useData } from '../context/DataContext';

const Rentals: React.FC = () => {
    const { rentals, vehicles, customers } = useData();
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

    const getStatusChip = (status: Rental['status']) => {
        const styles = {
            active: 'bg-green-500 text-white',
            completed: 'bg-gray-500 text-white',
            upcoming: 'bg-blue-500 text-white',
        };
        const text = {
            active: 'Aktivní',
            completed: 'Dokončeno',
            upcoming: 'Nadcházející',
        }
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(amount);
    };

    const selectedVehicle = selectedRental ? vehicles.find(v => v.id === selectedRental.vehicleId) : null;
    const selectedCustomer = selectedRental ? customers.find(c => c.id === selectedRental.customerId) : null;

    return (
        <>
            <Card>
                <h2 className="text-xl font-bold mb-4">Archiv smluv a pronájmů</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3">Zákazník</th>
                                <th className="p-3">Vozidlo</th>
                                <th className="p-3">Od</th>
                                <th className="p-3">Do</th>
                                <th className="p-3">Cena</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rentals.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(rental => {
                                const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                                const customer = customers.find(c => c.id === rental.customerId);
                                return (
                                    <tr key={rental.id} className="border-b border-gray-800 hover:bg-gray-800">
                                        <td className="p-3">{customer?.firstName} {customer?.lastName}</td>
                                        <td className="p-3">{vehicle?.brand} <span className="text-gray-400">({vehicle?.licensePlate})</span></td>
                                        <td className="p-3">{new Date(rental.startDate).toLocaleDateString('cs-CZ')}</td>
                                        <td className="p-3">{new Date(rental.endDate).toLocaleDateString('cs-CZ')}</td>
                                        <td className="p-3">{formatCurrency(rental.totalPrice)}</td>
                                        <td className="p-3">{getStatusChip(rental.status)}</td>
                                        <td className="p-3">
                                            <Button onClick={() => setSelectedRental(rental)}>Zobrazit smlouvu</Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {selectedRental && selectedVehicle && selectedCustomer && (
                <ContractView
                    rental={selectedRental}
                    vehicle={selectedVehicle}
                    customer={selectedCustomer}
                    onClose={() => setSelectedRental(null)}
                />
            )}
        </>
    );
};

export default Rentals;