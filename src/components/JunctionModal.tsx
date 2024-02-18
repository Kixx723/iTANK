import React from 'react';
import { Junction,ModalProps } from '../interfaces/types';

const JunctionModal: React.FC<ModalProps> = ({ isOpen, onClose, junction, onUpdate }) => {
  if (!isOpen || !junction) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const updatedData: Partial<Junction> = {
      // Assume form fields with names 'elevation', 'demand', etc.
      elevation: parseFloat(form.elevation.value),
      demand: parseFloat(form.demand.value),
      demandPattern: form.demandPattern.value,
      // Add other fields as necessary
    };
    onUpdate(junction.id, updatedData);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-lg shadow-2xl border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="elevation" className="block text-sm font-medium text-gray-700">Elevation</label>
          <input 
            name="elevation" 
            defaultValue={junction ? junction.elevation?.toFixed(2) : '0.00'} 
            type="text" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            placeholder="Elevation"
            pattern="^\d*(\.\d{0,2})?$"
            title="Please enter a valid number with up to two decimal places."
          />  
        </div>
        <div>
          <label htmlFor="demand" className="block text-sm font-medium text-gray-700">Demand</label>
          <input 
            name="demand" 
            defaultValue={junction ? junction.demand?.toFixed(2) : '0.00'} 
            type="text" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            placeholder="Elevation"
            pattern="^\d*(\.\d{0,2})?$"
            title="Please enter a valid number with up to two decimal places."
          />  
        </div>
        <div>
          <label htmlFor="demandPattern" className="block text-sm font-medium text-gray-700">Demand Pattern</label>
          <input 
            name="demandPattern" 
            defaultValue={junction ? junction.demandPattern : '0.00'} 
            type="text" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            placeholder="Demand Pattern"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Update Junction
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default JunctionModal;