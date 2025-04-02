"use client"
import { UserType } from '@/types/db';
import React, { useState, type FormEvent } from 'react';
import cn from "@/lib/cn";

const ExpenseForm = () => {
  const [spesa, setSpesa] = useState<number>(0);
  const [motivo, setMotivo] = useState<string>('');
  const [dipendente, setDipendente] = useState<string>('');

  const [users, setUsers] = useState<UserType[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/users'); //?q=SELECT%20*%20FROM%20%user%60
      const data = await res.json();
      setUsers(data.rows);
    };

    fetchData();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ spesa, motivo, dipendente });
  };

  const inputStyles = "border border-slate-400 rounded-xs p-2 text-slate-700 bg-slate-50 w-full  focus:outline outline-offset-2 outline-blue-500";
  const labelStyles = "text-slate-500 text-sm font-bold uppercase";
  const buttonStyles = "border rounded-xs p-2 font-bold uppercase text-sm text-blue-50 bg-blue-600 hover:bg-blue-500 border-blue-700 transition-colors w-full focus:outline outline-offset-2 outline-blue-500"

  return (
    <form onSubmit={handleSubmit}>
      <div className='my-4'>
        <label className={labelStyles} htmlFor="spesa">
          Importo spesa:
        </label>
        <div className='flex flex-row gap-0'>
        <span className={cn(inputStyles,'border-r-0 rounded-r-none w-fit bg-slate-50')}>
          €
        </span>
        <input
          type="number"
          step="0.01"
          id="spesa"
          value={spesa}
          onChange={(e) => setSpesa(parseFloat(e.target.value))}
          required
          className={cn(inputStyles, 'rounded-l-none')}
        />
        </div>
      </div>
      <div className='my-4'>
        <label className={labelStyles} htmlFor="motivo">Motivo:</label>
        <textarea
          id="motivo"
          placeholder='Per quale motivo hai effettuato questa spesa?'
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          required
          className={inputStyles}
        />
      </div>
      <div className='my-4'>
        <label className={labelStyles} htmlFor="dipendente">Fatta da:</label>
        <select
          id="dipendente"
          value={dipendente}
          onChange={(e) => setDipendente(e.target.value)}
          required
          className={inputStyles}
        >
          <option value="" disabled>
            Seleziona dipendente
          </option>
          {users.map((user, index) => (
            <option className='capitalize' key={`${index}-user${user.id}`} value={user.id}>
              {user.nome} {user.cognome}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className={buttonStyles}>Aggiungi spesa</button>
    </form>
  );
};

export default ExpenseForm;