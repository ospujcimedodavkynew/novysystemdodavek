import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button } from './ui';
import ContractView from './ContractView';
import type { Rental } from '../types';

const CalendarView: React.FC = () => {
  const { vehicles, rentals, customers, loading } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  const monthNames = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  
  const selectedVehicle = selectedRental ? vehicles.find(v => v.id === selectedRental.vehicle_id) : null;
  const selectedCustomer = selectedRental ? customers.find(c => c.id === selectedRental.customer_id) : null;

  const renderCalendarGrid = () => {
    const today = new Date();
    const isCurrentMonthToday = today.getFullYear() === year && today.getMonth() === month;

    return (
      <div className="grid border-l border-t border-gray-700" style={{ gridTemplateColumns: 'minmax(180px, 1fr) repeat(' + daysInMonth + ', minmax(40px, 1fr))' }}>
        {/* Header Row */}
        <div className="sticky left-0 bg-surface z-20 font-semibold p-2 border-r border-b border-gray-700 text-text-primary">Vozidlo</div>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
          <div key={day} className={`text-center font-semibold p-2 border-r border-b border-gray-700 ${isCurrentMonthToday && day === today.getDate() ? 'bg-accent text-white' : 'text-text-secondary'}`}>
            {day}
          </div>
        ))}

        {/* Vehicle Rows */}
        {vehicles.map(vehicle => (
          <React.Fragment key={vehicle.id}>
            <div className="sticky left-0 bg-surface z-10 p-2 border-r border-b border-gray-700 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex items-center">
              <div>
                {vehicle.brand}
                <span className="block text-xs text-gray-400">{vehicle.license_plate}</span>
              </div>
            </div>
            
            <div className="col-start-2 relative grid border-b border-gray-700" style={{ gridColumnEnd: 'span ' + daysInMonth, gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
                {Array.from({ length: daysInMonth }, (_, i) => <div key={i} className="h-14 border-r border-gray-800"></div>)}
                
                {rentals
                    .filter(r => r.vehicle_id === vehicle.id)
                    .map(rental => {
                        const rentalStart = new Date(rental.start_date);
                        const rentalEnd = new Date(rental.end_date);
                        const startOfMonth = new Date(year, month, 1);
                        const endOfMonth = new Date(year, month, daysInMonth, 23, 59, 59);

                        if (rentalEnd < startOfMonth || rentalStart > endOfMonth) {
                            return null;
                        }

                        const effectiveStart = rentalStart < startOfMonth ? startOfMonth : rentalStart;
                        const effectiveEnd = rentalEnd > endOfMonth ? endOfMonth : rentalEnd;
                        
                        const startDay = effectiveStart.getDate();
                        const endDay = effectiveEnd.getDate();

                        const customer = customers.find(c => c.id === rental.customer_id);

                        return (
                            <div
                                key={rental.id}
                                className="bg-primary hover:bg-primary-focus cursor-pointer rounded my-2 mx-px p-1 text-white text-xs overflow-hidden whitespace-nowrap flex items-center z-10"
                                style={{
                                    gridColumn: `${startDay} / ${endDay + 1}`,
                                }}
                                onClick={() => setSelectedRental(rental)}
                                title={`${customer?.first_name} ${customer?.last_name} (${rentalStart.toLocaleDateString('cs-CZ')} - ${rentalEnd.toLocaleDateString('cs-CZ')})`}
                            >
                                <p className="truncate pl-1">{customer?.first_name} {customer?.last_name}</p>
                            </div>
                        );
                    })}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };


  return (
    <>
    <Card>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-bold">{monthNames[month]} {year}</h2>
        <div className="flex gap-2">
          <Button onClick={goToPreviousMonth}>&lt;</Button>
          <Button onClick={goToToday} variant="secondary">Dnes</Button>
          <Button onClick={goToNextMonth}>&gt;</Button>
        </div>
      </div>
      <div className="overflow-x-auto bg-surface rounded-lg">
          {loading ? <div className="h-48 flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div> : renderCalendarGrid()}
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

export default CalendarView;
