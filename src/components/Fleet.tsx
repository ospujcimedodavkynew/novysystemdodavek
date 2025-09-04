import React, { useState } from 'react';
import type { Vehicle } from '../types';
import { Card, Button, Modal, Input, ConfirmModal } from './ui';
import { EditIcon, TrashIcon, PlusIcon, CalendarIcon, WrenchIcon, ShieldCheckIcon } from './Icons';
import { useData } from '../context/DataContext';

const VehicleForm: React.FC<{ vehicle?: Vehicle; onSave: (vehicle: Omit<Vehicle, 'id' | 'created_at'> | Vehicle) => void; onCancel: () => void; isSubmitting: boolean; }> = ({ vehicle, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState<Omit<Vehicle, 'id' | 'created_at'> | Vehicle>(vehicle || {
        brand: 'Renault Master',
        license_plate: '',
        vin: '',
        year: new Date().getFullYear(),
        last_service_date: null,
        last_service_cost: null,
        stk_date: null,
        insurance_info: null,
        vignette_until: null,
        pricing: { '4h': 0, '6h': 0, '12h': 0, '24h': 0, daily: 0 },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'last_service_cost') {
             setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
        } else if (name === 'year') {
             setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            const valueToSet = (e.target.type === 'date' || name === 'insurance_info') && value === '' ? null : value;
            setFormData(prev => ({ ...prev, [name]: valueToSet }));
        }
    };

    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, [name]: Number(value) } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Vehicle);
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
                 <Input label="SPZ" name="license_plate" value={formData.license_plate} onChange={handleChange} required />
                 <Input label="VIN" name="vin" value={formData.vin} onChange={handleChange} required />
                 <Input label="Rok výroby" name="year" type="number" value={formData.year} onChange={handleChange} required />
                 <Input label="Poslední servis (datum)" name="last_service_date" type="date" value={formData.last_service_date || ''} onChange={handleChange} />
                 <Input label="Cena servisu (Kč)" name="last_service_cost" type="number" value={String(formData.last_service_cost === null ? '' : formData.last_service_cost)} onChange={handleChange} />
                 <Input label="STK do" name="stk_date" type="date" value={formData.stk_date || ''} onChange={handleChange} />
                 <Input label="Dálniční známka do" name="vignette_until" type="date" value={formData.vignette_until || ''} onChange={handleChange} />
                 <Input label="Pojištění info" name="insurance_info" value={formData.insurance_info || ''} onChange={handleChange} className="md:col-span-2" />
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
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Ukládání...' : 'Uložit vozidlo'}</Button>
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
    
    const handleSave = async (vehicleData: Omit<Vehicle, 'id' | 'created_at'> | Vehicle) => {
        setIsSubmitting(true);
        try {
            if ('id' in vehicleData) {
                await updateVehicle(vehicleData as Vehicle);
                addToast('Vozidlo bylo úspěšně upraveno.', 'success');
            } else {
                await addVehicle(vehicleData as Omit<Vehicle, 'id' | 'created_at'>);
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
            rental.vehicle_id === vehicleId &&
            new Date(rental.start_date) <= now &&
            new Date(rental.end_date) > now
        );
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>
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
                                        <p className="text-accent font-mono">{vehicle.license_plate}</p>
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
                                    <p className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2 text-accent"/> <strong>STK do:</strong> {vehicle.stk_date ? new Date(vehicle.stk_date).toLocaleDateString('cs-CZ') : 'N/A'}</p>
                                    <p className="flex items-center"><WrenchIcon className="w-4 h-4 mr-2 text-accent"/> <strong>Servis:</strong> {vehicle.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString('cs-CZ') : 'N/A'}</p>
                                    <p className="flex items-center"><ShieldCheckIcon className="w-4 h-4 mr-2 text-accent"/> <strong>Známka do:</strong> {vehicle.vignette_until ? new Date(vehicle.vignette_until).toLocaleDateString('cs-CZ') : 'N/A'}</p>
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
                    isSubmitting={isSubmitting}
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
