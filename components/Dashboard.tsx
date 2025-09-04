
import React, { useState, useMemo } from 'react';
import { Card, Button, Modal } from './ui';
import { TruckIcon, UsersIcon, CheckCircleIcon, UserPlusIcon, AlertTriangleIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import NewRentalForm from './NewRentalForm';
import ContractView from './ContractView';
import type { Rental, Vehicle } from '../types';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 mr-4 text-primary bg-primary bg-opacity-20 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </Card>
);

const AttentionItem: React.FC<{ vehicle: Vehicle, reason: string, date: string }> = ({ vehicle, reason, date }) => (
    <div className="p-3 bg-gray-900 rounded-lg flex justify-between items-center">
        <div>
            <p className="font-bold">{vehicle.brand} ({vehicle.licensePlate})</p>
            <p className="text-sm text-text-secondary">{reason}</p>
        </div>
        <div className="text-right">
            <p className="font-semibold text-red-400">{new Date(date).toLocaleDateString('cs-CZ')}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { vehicles, rentals, customers } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingRental, setViewingRental] = useState<Rental | null>(null);

    const activeRentals = rentals.filter(r => r.status === 'active');
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(amount);
    };

    const attentionItems = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const stkSoon = vehicles.filter(v => {
            const stkDate = new Date(v.stkDate);
            return stkDate <= thirtyDaysFromNow && stkDate >= now;
        });

        const vignetteSoon = vehicles.filter(v => {
            const vignetteDate = new Date(v.vignetteUntil);
            return vignetteDate <= thirtyDaysFromNow && vignetteDate >= now;
        });
        
        const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
        const today = new Date();

        const returningToday = rentals.filter(r => {
            const endDate = new Date(r.endDate);
            return r.status === 'active' && isSameDay(endDate, today);
        });

        return { stkSoon, vignetteSoon, returningToday };
    }, [vehicles, rentals]);
    
    const revenueByVehicle = useMemo(() => {
        const revenueMap = new Map<string, number>();
        rentals.forEach(rental => {
            const vehicle = vehicles.find(v => v.id === rental.vehicleId);
            if (vehicle) {
                const currentRevenue = revenueMap.get(vehicle.brand) || 0;
                revenueMap.set(vehicle.brand, currentRevenue + rental.totalPrice);
            }
        });
        return Array.from(revenueMap.entries()).map(([name, revenue]) => ({ name, 'Příjmy': revenue }));
    }, [rentals, vehicles]);
    
    const selectedVehicleForView = viewingRental ? vehicles.find(v => v.id === viewingRental.vehicleId) : null;
    const selectedCustomerForView = viewingRental ? customers.find(c => c.id === viewingRental.customerId) : null;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Přehled</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <UserPlusIcon className="w-5 h-5 mr-2"/>
                    Nová Rezervace
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Vozidel na cestě" value={activeRentals.length} icon={<TruckIcon className="w-6 h-6" />} />
                <StatCard title="Všech zákazníků" value={customers.length} icon={<UsersIcon className="w-6 h-6" />} />
                <StatCard title="Dokončených pronájmů" value={rentals.filter(r => r.status === 'completed').length} icon={<CheckCircleIcon className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold mb-4 flex items-center"><AlertTriangleIcon className="w-6 h-6 mr-3 text-red-500"/>Vyžaduje pozornost</h3>
                        <div className="space-y-4">
                            {attentionItems.returningToday.length > 0 && attentionItems.returningToday.map(rental => {
                                const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                                return vehicle && <AttentionItem key={`ret-${rental.id}`} vehicle={vehicle} reason="Vrátit dnes" date={rental.endDate} />
                            })}
                             {attentionItems.stkSoon.length > 0 && attentionItems.stkSoon.map(vehicle => (
                                <AttentionItem key={`stk-${vehicle.id}`} vehicle={vehicle} reason="Končí STK" date={vehicle.stkDate} />
                            ))}
                            {attentionItems.vignetteSoon.length > 0 && attentionItems.vignetteSoon.map(vehicle => (
                                <AttentionItem key={`vig-${vehicle.id}`} vehicle={vehicle} reason="Končí dálniční známka" date={vehicle.vignetteUntil} />
                            ))}
                             {attentionItems.stkSoon.length === 0 && attentionItems.vignetteSoon.length === 0 && attentionItems.returningToday.length === 0 && (
                                <p className="text-text-secondary">Žádné nadcházející události nevyžadují pozornost.</p>
                            )}
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold mb-4">Aktivní Pronájmy</h3>
                        <div className="space-y-4">
                            {activeRentals.length > 0 ? activeRentals.sort((a,b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()).map(rental => {
                                const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                                const customer = customers.find(c => c.id === rental.customerId);
                                return (
                                    <div 
                                      key={rental.id} 
                                      className="p-3 bg-gray-900 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors"
                                      onClick={() => setViewingRental(rental)}
                                    >
                                        <div>
                                            <p className="font-bold">{vehicle?.brand} ({vehicle?.licensePlate})</p>
                                            <p className="text-sm text-text-secondary">{customer?.firstName} {customer?.lastName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-accent">Návrat:</p>
                                            <p className="text-sm">{new Date(rental.endDate).toLocaleString('cs-CZ')}</p>
                                        </div>
                                    </div>
                                );
                            }) : <p className="text-text-secondary">Žádná vozidla nejsou aktuálně na cestě.</p>}
                        </div>
                    </Card>
                </div>

                <Card className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Výkonnost Vozidel (Příjmy)</h3>
                    <div className="h-96">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByVehicle} margin={{ top: 5, right: 20, left: 20, bottom: 5 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                                <XAxis type="number" stroke="#D1D5DB" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                                <YAxis type="category" dataKey="name" stroke="#D1D5DB" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                <Tooltip
                                    cursor={{ fill: '#374151' }}
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend />
                                <Bar dataKey="Příjmy" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Vytvořit novou rezervaci">
                <NewRentalForm onSave={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
            </Modal>

            {viewingRental && selectedVehicleForView && selectedCustomerForView && (
                <ContractView
                    rental={viewingRental}
                    vehicle={selectedVehicleForView}
                    customer={selectedCustomerForView}
                    onClose={() => setViewingRental(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
