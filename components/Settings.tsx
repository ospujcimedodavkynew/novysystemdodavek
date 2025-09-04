
import React from 'react';
import { useData } from '../context/DataContext';
import { Card, Input } from './ui';

const Settings: React.FC = () => {
  const { bankAccountNumber, setBankAccountNumber } = useData();

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankAccountNumber(e.target.value);
  };

  return (
    <div>
      <Card>
        <h2 className="text-xl font-bold mb-4">Nastavení plateb</h2>
        <div className="max-w-md">
          <Input
            label="Číslo bankovního účtu (IBAN)"
            name="bankAccountNumber"
            value={bankAccountNumber}
            onChange={handleAccountChange}
            placeholder="CZ00 0000 0000 0000 0000 0000"
            required
          />
          <p className="text-xs text-gray-400 mt-2">
            Zadejte prosím celé číslo účtu ve formátu IBAN. Toto číslo bude použito pro generování platebních QR kódů.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
