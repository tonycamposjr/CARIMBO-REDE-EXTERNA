import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import type { StampFormData } from '../types';

const initialFormData: StampFormData = {
    tecnico: '',
    rotaCabo: '',
    numeroCabo: '',
    fibrasPrioritarias: '',
    capacidadeCabo: '',
    fila: '',
    bastidor: '',
    bandeja: '',
    medicaoCentralCliente: '',
    medicaoClienteCentral: '',
    distanciaTotal: '',
    houveDeslocamento: 'Não',
    tempoDeslocamento: '',
    TAouTicket: 'TA',
    numeroTAouTicket: '',
    cliente: '',
    cienteRedeExterna: '',
};

const requiredFields: (keyof StampFormData)[] = ['tecnico', 'rotaCabo', 'cliente'];

interface StampFormProps {
    showToast: (message: string, type: 'success' | 'error') => void;
}

const FormField: React.FC<{ label: string; id: keyof StampFormData; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; type?: string; pattern?: string; error?: string; children?: React.ReactNode }> = ({ label, id, value, onChange, required, type = 'text', pattern, error, children }) => (
    <div className="mb-5">
        <label htmlFor={id} className="font-semibold text-sm text-gray-700 block mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            pattern={pattern}
            className={`w-full p-3 rounded-lg border-2 bg-white shadow-sm transition-all focus:ring-2 focus:outline-none ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {children}
    </div>
);

const RadioGroup: React.FC<{ label: string; name: keyof StampFormData; value: string; options: { value: string; label: string }[]; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, options, onChange }) => (
    <div className="mb-5">
        <label className="font-semibold text-sm text-gray-700 block mb-2">{label}</label>
        <div className="flex gap-x-6 gap-y-2 flex-wrap">
            {options.map(opt => (
                <label key={opt.value} htmlFor={`${name}-${opt.value}`} className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        id={`${name}-${opt.value}`}
                        name={name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={onChange}
                        className="hidden"
                    />
                    <span className={`w-5 h-5 mr-2 rounded-full border-2 flex items-center justify-center transition-all ${value === opt.value ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'}`}>
                        {value === opt.value && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </span>
                    <span className={`font-medium ${value === opt.value ? 'text-blue-600' : 'text-gray-600'}`}>{opt.label}</span>
                </label>
            ))}
        </div>
    </div>
);

export const StampFormComponent: React.FC<StampFormProps> = ({ showToast }) => {
    const [formData, setFormData] = useState<StampFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof StampFormData, string>>>({});
    const [stampResult, setStampResult] = useState<React.ReactNode | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'radio') {
             setFormData(prev => ({ ...prev, [name]: value as 'Sim' | 'Não' | 'TA' | 'Ticket' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (requiredFields.includes(name as keyof StampFormData) && value.trim()) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    useEffect(() => {
        const { distanciaTotal, medicaoCentralCliente, medicaoClienteCentral } = formData;
        const dt = parseFloat(distanciaTotal);
        const cpc = parseFloat(medicaoCentralCliente);
        const spc = parseFloat(medicaoClienteCentral);

        const activeElement = document.activeElement as HTMLInputElement;
        const activeName = activeElement?.name;
        
        if (!isNaN(cpc) && !isNaN(spc) && activeName !== 'distanciaTotal') {
            setFormData(prev => ({ ...prev, distanciaTotal: (cpc + spc).toFixed(2) }));
        } else if (!isNaN(dt) && !isNaN(cpc) && activeName !== 'medicaoClienteCentral') {
            setFormData(prev => ({ ...prev, medicaoClienteCentral: (dt - cpc).toFixed(2) }));
        } else if (!isNaN(dt) && !isNaN(spc) && activeName !== 'medicaoCentralCliente') {
            setFormData(prev => ({ ...prev, medicaoCentralCliente: (dt - spc).toFixed(2) }));
        }
    }, [formData.distanciaTotal, formData.medicaoCentralCliente, formData.medicaoClienteCentral]);

    const validateForm = () => {
        const newErrors: Partial<Record<keyof StampFormData, string>> = {};
        requiredFields.forEach(field => {
            if (!formData[field].trim()) {
                newErrors[field] = 'Campo obrigatório';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGenerate = () => {
        if (!validateForm()) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const dataAtual = new Date().toLocaleString('pt-BR');
        const result = (
            <div className="border-2 border-dashed border-blue-500 p-6 rounded-xl bg-white shadow-inner mt-4 relative">
                 <span className="absolute top-[-12px] left-5 font-bold text-sm text-blue-500 bg-white px-2 transform -rotate-2">
                    CARIMBO OFICIAL
                </span>
                <h3 className="text-lg font-bold text-blue-600 text-center mb-4">### CARIMBO DE REDE EXTERNA ###</h3>
                <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Data/Hora:</strong> {dataAtual}</p>
                    {Object.entries(formData).map(([key, value]) => {
                        if (!value) return null;
                        const label = document.querySelector(`label[for="${key}"]`)?.textContent?.replace(' *', '') || key;
                        const formattedValue = key.toLowerCase().includes('medicao') || key.toLowerCase().includes('distancia') ? `${value} metros` : value;
                        if (['tecnico', 'rotaCabo', 'cliente', 'numeroCabo', 'fibrasPrioritarias', 'capacidadeCabo', 'fila', 'bastidor', 'bandeja', 'medicaoCentralCliente', 'medicaoClienteCentral', 'distanciaTotal', 'houveDeslocamento', 'tempoDeslocamento', 'TAouTicket', 'numeroTAouTicket', 'cienteRedeExterna'].includes(key)) {
                             return <p key={key}><strong>{label}:</strong> {formattedValue}</p>;
                        }
                        return null;
                    })}
                </div>
                <p className="text-right text-xs text-gray-400 mt-4 italic">Dev By TonyCampos</p>
            </div>
        );
        setStampResult(result);
        showToast('Carimbo gerado com sucesso!', 'success');
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleClear = () => {
        if (window.confirm('Tem certeza que deseja limpar todos os campos?')) {
            setFormData(initialFormData);
            setErrors({});
            setStampResult(null);
            showToast('Formulário limpo com sucesso!', 'success');
        }
    };
    
    const handleCopy = () => {
        if (!resultRef.current || !stampResult) {
            showToast('Nenhum carimbo para copiar. Gere um carimbo primeiro.', 'error');
            return;
        }

        const textToCopy = resultRef.current.innerText
            .replace(/^CARIMBO OFICIAL\n/, "")
            .replace(/^### CARIMBO DE REDE EXTERNA ###\n/, "")
            .replace(/\n\s*\n/g, '\n')
            .replace(/Dev By TonyCampos\s*$/, "")
            .trim();

        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Carimbo copiado com sucesso!', 'success');
        }).catch(() => {
            showToast('Falha ao copiar o carimbo.', 'error');
        });
    };

    return (
        <Card title="CARIMBO DE REDE EXTERNA" icon="🔧">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <FormField label="Técnico - Nome/TEL" id="tecnico" value={formData.tecnico} onChange={handleInputChange} required error={errors.tecnico} />
                <FormField label="Rota Completa do Cabo" id="rotaCabo" value={formData.rotaCabo} onChange={handleInputChange} required error={errors.rotaCabo} />
                <FormField label="Número do Cabo" id="numeroCabo" value={formData.numeroCabo} onChange={handleInputChange} />
                <FormField label="Fibras Prioritárias" id="fibrasPrioritarias" value={formData.fibrasPrioritarias} onChange={handleInputChange} />
                <FormField label="Capacidade do cabo" id="capacidadeCabo" value={formData.capacidadeCabo} onChange={handleInputChange} type="number" pattern="[0-9]*" />
                <FormField label="Fila" id="fila" value={formData.fila} onChange={handleInputChange} />
                <FormField label="Bastidor" id="bastidor" value={formData.bastidor} onChange={handleInputChange} />
                <FormField label="Bandeja" id="bandeja" value={formData.bandeja} onChange={handleInputChange} />
                <FormField label="Medição do Ponto de Ruptura: CENTRAL para Cliente (metros)" id="medicaoCentralCliente" value={formData.medicaoCentralCliente} onChange={handleInputChange} type="number" />
                <FormField label="Medição do Ponto de Ruptura: Cliente para CENTRAL (metros)" id="medicaoClienteCentral" value={formData.medicaoClienteCentral} onChange={handleInputChange} type="number" />
                <FormField label="Distância total entre os pontos envolvidos (metros)" id="distanciaTotal" value={formData.distanciaTotal} onChange={handleInputChange} type="number">
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 text-xs text-blue-700">
                        💡 Dica: Preencha dois campos de medição para calcular o terceiro automaticamente.
                    </div>
                </FormField>
                <RadioGroup label="Houve Deslocamento" name="houveDeslocamento" value={formData.houveDeslocamento} options={[{ value: 'Sim', label: 'Sim' }, { value: 'Não', label: 'Não' }]} onChange={handleInputChange} />
                <FormField label="Tempo de Deslocamento" id="tempoDeslocamento" value={formData.tempoDeslocamento} onChange={handleInputChange} />
                <RadioGroup label="TA ou Ticket" name="TAouTicket" value={formData.TAouTicket} options={[{ value: 'TA', label: 'TA' }, { value: 'Ticket', label: 'Ticket' }]} onChange={handleInputChange} />
                <FormField label="Número" id="numeroTAouTicket" value={formData.numeroTAouTicket} onChange={handleInputChange} />
                <FormField label="Cliente" id="cliente" value={formData.cliente} onChange={handleInputChange} required error={errors.cliente} />
                <FormField label="Ciente Rede Externa" id="cienteRedeExterna" value={formData.cienteRedeExterna} onChange={handleInputChange} />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleGenerate} className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">🔧 Gerar Carimbo</button>
                <button onClick={handleClear} className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-br from-gray-600 to-gray-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">🗑️ Limpar</button>
                <button onClick={handleCopy} className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-br from-green-500 to-emerald-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">📋 Copiar Carimbo</button>
            </div>
            
            <div ref={resultRef} className="mt-6">
                {stampResult}
            </div>
        </Card>
    );
};