import React from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

const FormField = ({ field, value, onChange, onSelectChange }) => {
  const { id, label, type = 'text', placeholder, required, options, rows } = field;

  const commonProps = {
    id: id,
    name: id,
    value: value || '',
    onChange: onChange,
    placeholder: placeholder,
    required: required,
    className: "bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500"
  };

  return (
    <div className="space-y-2 mb-4">
      <Label htmlFor={id} className="text-slate-300 font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {type === 'textarea' ? (
        <Textarea {...commonProps} rows={rows || 3} />
      ) : type === 'select' ? (
        <Select
          name={id}
          value={value || ''}
          onValueChange={(selectValue) => onSelectChange(id, selectValue)}
          required={required}
        >
          <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:ring-purple-500 focus:border-purple-500">
            <SelectValue placeholder={placeholder || 'Selecione...'} />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600 text-white">
            {options?.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="hover:bg-purple-600 focus:bg-purple-600"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input type={type} {...commonProps} />
      )}
    </div>
  );
};

export default FormField;