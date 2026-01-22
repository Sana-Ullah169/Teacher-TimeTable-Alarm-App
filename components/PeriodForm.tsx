
import React, { useState } from 'react';
import { Day, Period } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { Button } from './ui/Button';

interface PeriodFormProps {
  initialData?: Period;
  onSave: (period: Omit<Period, 'id'>) => void;
  onCancel: () => void;
}

export const PeriodForm: React.FC<PeriodFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    className: initialData?.className || '',
    subjectName: initialData?.subjectName || '',
    startTime: initialData?.startTime || '08:00',
    endTime: initialData?.endTime || '09:00',
    day: initialData?.day || Day.MONDAY,
    isAlarmOn: initialData?.isAlarmOn ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {initialData ? 'Edit Period' : 'Add New Period'}
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
        <input
          required
          type="text"
          placeholder="e.g. Class 6B"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={formData.className}
          onChange={e => setFormData(prev => ({ ...prev, className: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          required
          type="text"
          placeholder="e.g. English"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={formData.subjectName}
          onChange={e => setFormData(prev => ({ ...prev, subjectName: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            required
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.startTime}
            onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            required
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.endTime}
            onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={formData.day}
          onChange={e => setFormData(prev => ({ ...prev, day: e.target.value as Day }))}
        >
          {DAYS_OF_WEEK.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          id="alarm-toggle"
          type="checkbox"
          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={formData.isAlarmOn}
          onChange={e => setFormData(prev => ({ ...prev, isAlarmOn: e.target.checked }))}
        />
        <label htmlFor="alarm-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
          Enable alarm for this period
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          Save Period
        </Button>
      </div>
    </form>
  );
};
