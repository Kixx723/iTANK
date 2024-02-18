export interface Node {
    id: number;
    longitude: number; 
    latitude: number; 
    type: string;
    junction?: Junction;
}

export interface Junction {
  id: number;
  nodeId?: number;
  elevation?: number;
  demand?: number;
  demandPattern?: string;
}

export interface EpanetNode {
  id: number,
  type: string,
}

export interface Link {
  id: number;
  positions: { latitude: number; longitude: number; }[];
  name?: string,
  type: string,
}

export interface PolylinePoint {
  latitude: number;
  longitude: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  junction: Junction | null;
  onUpdate: (junctionId: number, updatedData: Partial<Junction>) => void;
}


export type MapNodeType = 'tank' | 'reservoir' | 'junction';