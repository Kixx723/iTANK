import React from 'react';
import { Project, Workspace } from 'epanet-js';

interface SidePanelProps {
  onSelectNodeType: (nodeType: string) => void;
  onSelectLinkType: (nodeType: string) => void;
}



const SidePanel: React.FC<SidePanelProps> = ({ onSelectNodeType, onSelectLinkType }) => {
  return (
    <div style={{ width: '250px', height: '100vh', position: 'absolute', zIndex: 1000, background: '#808080' }}>
      <div>
      <button onClick={() => onSelectNodeType('junction')}>Add Junction</button>
      <button onClick={() => onSelectNodeType('tank')}>Add Tank</button>
      <button onClick={() => onSelectNodeType('reservoir')}>Add Reservoir</button>
      <button onClick={() => onSelectLinkType('pipe')}>Add Pipe</button>
      <button onClick={() => onSelectLinkType('pump')}>Add Pump</button>
      </div>
      <div>
      </div>
    </div>
  );
};

export default SidePanel;