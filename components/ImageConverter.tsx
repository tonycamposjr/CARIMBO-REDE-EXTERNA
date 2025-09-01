import React, { useState, useCallback, useRef } from 'react';
import { Card } from './ui/Card';

interface ImageConverterProps {
    showToast: (message: string, type: 'success' | 'error') => void;
}

export const ImageConverterComponent: React.FC<ImageConverterProps> = ({ showToast }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('png');
    const [convertedImage, setConvertedImage] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== 'image/bmp' && !file.name.toLowerCase().endsWith('.bmp')) {
                showToast('Por favor, selecione um arquivo BMP válido.', 'error');
                return;
            }
            setSelectedFile(file);
            setConvertedImage(null); // Reset previous conversion
        }
    };

    const handleConvert = useCallback(() => {
        if (!selectedFile) {
            showToast('Por favor, selecione um arquivo BMP para converter.', 'error');
            return;
        }

        setIsConverting(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    showToast('Não foi possível processar a imagem.', 'error');
                    setIsConverting(false);
                    return;
                }
                ctx.drawImage(img, 0, 0);

                // Add watermark
                const watermarkText = 'Dev By TonyCampos';
                const padding = 10;
                const fontSize = Math.max(12, Math.min(canvas.width / 25, canvas.height / 25));
                ctx.font = `bold ${fontSize}px Arial, sans-serif`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);

                const mimeType = `image/${outputFormat}`;
                const dataUrl = canvas.toDataURL(mimeType, 0.9); // 0.9 for JPEG quality

                setConvertedImage(dataUrl);
                showToast('Imagem convertida com sucesso!', 'success');
                setIsConverting(false);
            };
            img.onerror = () => {
                showToast('Arquivo de imagem inválido ou corrompido.', 'error');
                setIsConverting(false);
            };
            img.src = e.target?.result as string;
        };
        reader.onerror = () => {
            showToast('Erro ao ler o arquivo.', 'error');
            setIsConverting(false);
        };
        reader.readAsDataURL(selectedFile);
    }, [selectedFile, outputFormat, showToast]);

    const newFileName = selectedFile ? `${selectedFile.name.replace(/\.[^/.]+$/, "")}.${outputFormat}` : '';

    return (
        <Card title="CONVERSOR DE IMAGEM (BMP para PNG/JPEG)" icon="🖼️">
            <div className="space-y-6">
                <div>
                    <label htmlFor="bmpUploader" className="font-semibold text-sm text-gray-700 block mb-2">
                        1. Selecione a imagem BMP:
                    </label>
                    <input
                        type="file"
                        id="bmpUploader"
                        accept=".bmp,image/bmp"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                </div>

                <div>
                    <label className="font-semibold text-sm text-gray-700 block mb-2">
                        2. Escolha o formato de saída:
                    </label>
                    <div className="flex gap-6">
                        {(['png', 'jpeg'] as const).map(format => (
                            <label key={format} htmlFor={`format-${format}`} className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    id={`format-${format}`}
                                    name="outputFormat"
                                    value={format}
                                    checked={outputFormat === format}
                                    onChange={() => setOutputFormat(format)}
                                    className="hidden"
                                />
                                <span className={`w-5 h-5 mr-2 rounded-full border-2 flex items-center justify-center transition-all ${outputFormat === format ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'}`}>
                                    {outputFormat === format && <span className="w-2 h-2 rounded-full bg-white"></span>}
                                </span>
                                <span className={`font-medium ${outputFormat === format ? 'text-blue-600' : 'text-gray-600'}`}>{format.toUpperCase()}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex justify-center">
                    <button
                        onClick={handleConvert}
                        disabled={isConverting || !selectedFile}
                        className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isConverting ? 'Convertendo...' : '✨ Converter Imagem'}
                    </button>
                </div>
            </div>

            {convertedImage && (
                <div className="mt-8 p-6 border-t-2 border-gray-200">
                    <h3 className="text-lg font-bold text-blue-600 text-center mb-4">Conversão Concluída!</h3>
                    <div className="flex flex-col items-center">
                        <p className="font-semibold text-sm mb-2">Pré-visualização:</p>
                        <img
                            src={convertedImage}
                            alt="Imagem convertida"
                            className="max-w-full h-auto max-h-80 rounded-lg shadow-lg border-4 border-white mb-6"
                        />
                        <a
                            href={convertedImage}
                            download={newFileName}
                            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-br from-green-500 to-emerald-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            📥 Baixar {newFileName.toUpperCase()}
                        </a>
                    </div>
                </div>
            )}
        </Card>
    );
};