import React, { useState } from 'react';
import type { Vehicle } from '../types';
import { Card, Button, Modal, Input, ConfirmModal } from './ui';
import { EditIcon, TrashIcon, PlusIcon, CalendarIcon, WrenchIcon, ShieldCheckIcon } from './Icons';
import { useData } from '../context/DataContext';

const VehicleForm: React.FC<{ vehicle?: Vehicle; onSave: (vehicle: Omit<Vehicle, 'id'> | Vehicle) => void; onCancel: () => void; }> = ({ vehicle, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Vehicle, 'id'> | Vehicle>(vehicle || {
        brand: 'Renault Master',
        licensePlate: '',
        vin: '',
        year: new Date().getFullYear(),
        lastServiceDate: '',
        lastServiceCost: 0,
        stkDate: '',
        insuranceInfo: '',
        vignetteUntil: '',
        pricing: { '4h': 0, '6h': 0, '12h': 0, '24h': 0, daily: 0 },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, [name]: Number(value) } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Značka</label>
                    <select name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-text-primary focus:ring-accent focus:border-accent">
                        <option>Renault Master</option>
                        <option>Opel Movano</option>
                        <option>Fiat Ducato</option>
                        <option>Peugeot Boxer</option>
                        <option>Mercedes Sprinter</option>
                    </select>
                </div>
                 <Input label="SPZ" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required />
                 <Input label="VIN" name="vin" value={formData.vin} onChange={handleChange} required />
                 <Input label="Rok výroby" name="year" type="number" value={formData.year} onChange={handleChange} required />
                 <Input label="Poslední servis (datum)" name="lastServiceDate" type="date" value={formData.lastServiceDate} onChange={handleChange} />
                 <Input label="Cena servisu (Kč)" name="lastServiceCost" type="number" value={String(formData.lastServiceCost)} onChange={handleChange} />
                 <Input label="STK do" name="stkDate" type="date" value={formData.stkDate} onChange={handleChange} />
                 <Input label="Dálniční známka do" name="vignetteUntil" type="date" value={formData.vignetteUntil} onChange={handleChange} />
                 <Input label="Pojištění info" name="insuranceInfo" value={formData.insuranceInfo} onChange={handleChange} className="md:col-span-2" />
            </div>
            <h3 className="text-lg font-semibold pt-4 border-t border-gray-700">Ceník (Kč)</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Input label="4 hodiny" name="4h" type="number" value={formData.pricing['4h']} onChange={handlePricingChange} />
                <Input label="6 hodin" name="6h" type="number" value={formData.pricing['6h']} onChange={handlePricingChange} />
                <Input label="12 hodin" name="12h" type="number" value={formData.pricing['12h']} onChange={handlePricingChange} />
                <Input label="24 hodin" name="24h" type="number" value={formData.pricing['24h']} onChange={handlePricingChange} />
                <Input label="Den (více dní)" name="daily" type="number" value={formData.pricing.daily} onChange={handlePricingChange} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Zrušit</Button>
                <Button type="submit">Uložit vozidlo</Button>
            </div>
        </form>
    );
};


const Fleet: React.FC = () => {
    const { vehicles, rentals, addToast, addVehicle, updateVehicle, deleteVehicle, loading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

    const handleAdd = () => {
        setEditingVehicle(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleDelete = (vehicleId: string) => {
        setConfirmingDelete(vehicleId);
    };

    const confirmDelete = async () => {
        if (confirmingDelete) {
            try {
                await deleteVehicle(confirmingDelete);
                addToast('Vozidlo bylo smazáno.', 'info');
            } finally {
                setConfirmingDelete(null);
            }
        }
    };
    
    const handleSave = async (vehicleData: Omit<Vehicle, 'id'> | Vehicle) => {
        setIsSubmitting(true);
        try {
            if ('id' in vehicleData) {
                await updateVehicle(vehicleData as Vehicle);
                addToast('Vozidlo bylo úspěšně upraveno.', 'success');
            } else {
                await addVehicle(vehicleData);
                addToast('Vozidlo bylo úspěšně přidáno.', 'success');
            }
            setIsModalOpen(false);
        } catch(e) {
            // Toast is handled in context
        } finally {
            setIsSubmitting(false);
        }
    };

    const isVehicleOnRent = (vehicleId: string): boolean => {
        const now = new Date();
        return rentals.some(rental =>
            rental.vehicleId === vehicleId &&
            new Date(rental.startDate) <= now &&
            new Date(rental.endDate) > now
        );
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-full">Načítání vozového parku...</div>
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <Button onClick={handleAdd}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Přidat vozidlo
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map(vehicle => {
                    const isOnRent = isVehicleOnRent(vehicle.id);
                    return (
                        <Card key={vehicle.id} className="flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">{vehicle.brand}</h3>
                                        <p className="text-accent font-mono">{vehicle.licensePlate}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isOnRent ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                                            {isOnRent ? 'Na cestě' : 'Volné'}
                                        </span>
                                        <button onClick={() => handleEdit(vehicle)} className="p-2 text-text-secondary hover:text-white"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(vehicle.id)} className="p-2 text-red-500 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2 text-sm">
                                    <p className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2 text-accent"/> <strong>STK do:</strong> {new Date(vehicle.stkDate).toLocaleDateString('cs-CZ')}</p>
                                    <p className="flex items-center"><WrenchIcon className="w-4 h-4 mr-2 text-accent"/> <strong>Servis:</strong> {new Date(vehicle.lastServiceDate).toLocaleDateString('cs-CZ')}</p>
                                    <p className="flex items-center"><ShieldCheckIcon className="w-4 h-4 mr-2 text-accent"/> <strong>Známka do:</strong> {new Date(vehicle.vignetteUntil).toLocaleDateString('cs-CZ')}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 text-right">
                                 <p className="font-semibold text-lg">{vehicle.pricing['24h']} Kč / 24h</p>
                            </div>
                        </Card>
                    )
                })}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVehicle ? 'Upravit vozidlo' : 'Přidat nové vozidlo'}>
                <VehicleForm 
                    vehicle={editingVehicle}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
            
            <ConfirmModal
                isOpen={!!confirmingDelete}
                onClose={() => setConfirmingDelete(null)}
                onConfirm={confirmDelete}
                title="Smazat vozidlo"
            >
                <p>Opravdu chcete trvale smazat toto vozidlo? Tuto akci nelze vrátit zpět.</p>
            </ConfirmModal>
        </div>
    );
};

export default Fleet;
