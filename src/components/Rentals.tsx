import React, { useState } from 'react';
import type { Rental } from '../types';
import { Card, Button } from './ui';
import ContractView from './ContractView';
import { useData } from '../context/DataContext';

const Rentals: React.FC = () => {
    const { rentals, vehicles, customers, loading } = useData();
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

    const selectedVehicle = selectedRental ? vehicles.find(v => v.id === selectedRental.vehicle_id) : null;
    const selectedCustomer = selectedRental ? customers.find(c => c.id === selectedRental.customer_id) : null;

    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>
    }

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
                            {rentals.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map(rental => {
                                const vehicle = vehicles.find(v => v.id === rental.vehicle_id);
                                const customer = customers.find(c => c.id === rental.customer_id);
                                return (
                                    <tr key={rental.id} className="border-b border-gray-800 hover:bg-gray-800">
                                        <td className="p-3">{customer?.first_name} {customer?.last_name}</td>
                                        <td className="p-3">{vehicle?.brand} <span className="text-gray-400">({vehicle?.license_plate})</span></td>
                                        <td className="p-3">{new Date(rental.start_date).toLocaleDateString('cs-CZ')}</td>
                                        <td className="p-3">{new Date(rental.end_date).toLocaleDateString('cs-CZ')}</td>
                                        <td className="p-3">{formatCurrency(rental.total_price)}</td>
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
