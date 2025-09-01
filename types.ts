
export interface StampFormData {
    tecnico: string;
    rotaCabo: string;
    numeroCabo: string;
    fibrasPrioritarias: string;
    capacidadeCabo: string;
    fila: string;
    bastidor: string;
    bandeja: string;
    medicaoCentralCliente: string;
    medicaoClienteCentral: string;
    distanciaTotal: string;
    houveDeslocamento: 'Sim' | 'Não';
    tempoDeslocamento: string;
    TAouTicket: 'TA' | 'Ticket';
    numeroTAouTicket: string;
    cliente: string;
    cienteRedeExterna: string;
}

export type ToastType = 'success' | 'error';

export interface ToastState {
    id: number;
    message: string;
    type: ToastType;
}
