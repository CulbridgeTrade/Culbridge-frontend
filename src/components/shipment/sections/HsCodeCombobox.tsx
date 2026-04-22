"use client"

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CheckIcon, ChevronsUpDown, Search } from "lucide-react";
import api from '@/lib/api';

const hsCodes = [
  { code: '120740', description: 'Sesame seeds, whether or not broken' },
  { code: '180100', description: 'Cocoa beans, whole or broken, raw or roasted' },
  { code: '091011', description: 'Ginger, fresh or dried' },
  { code: '080260', description: 'Macadamia nuts' },
]; // Fallback

interface HsCodeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HsCodeCombobox({ value, onChange, placeholder = 'Search HS Code...' }: HsCodeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [codes, setCodes] = useState(hsCodes);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Try API, fallback local
    api.get('/hs-codes.json').then(setCodes).catch(() => setCodes(hsCodes));
  }, []);

  const filteredCodes = codes.filter(code => 
    code.code.toLowerCase().includes(search.toLowerCase()) || 
    code.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {value ? `${value}` : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 max-w-[600px]">
        <Command>
          <CommandInput placeholder={placeholder} onValueChange={setSearch}>
            <Search className="mr-2 h-4 w-4 opacity-50" />
          </CommandInput>
          <CommandEmpty>No HS code found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredCodes.map((codeObj) => (
              <CommandItem
                key={codeObj.code}
                value={codeObj.code}
                onSelect={() => {
                  onChange(codeObj.code === value ? '' : codeObj.code);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === codeObj.code ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span>{codeObj.code} - {codeObj.description}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
