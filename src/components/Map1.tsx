import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, LatLngExpression} from 'leaflet';
import SidePanel from './SidePanel';
import { Project, Workspace, NodeType, CountType, LinkType, LinkProperty } from "epanet-js";
import { Junction, EpanetNode, Node, Link, PolylinePoint, MapNodeType } from '../interfaces/types'; 
import axios from 'axios';
import JunctionModal from './JunctionModal';

const ws = new Workspace();
const model = new Project(ws);

const Map1: React.FC = () => {
  const defaultPosition: LatLngExpression = [6.1164, 125.1716]; 
  const zoomLevel: number = 13;
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNodeType, setSelectedNodeType] = useState<string>('');
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedLinkType, setSelectedLinkType] = useState<string>('');
  const [linkStartNode, setLinkStartNode] = useState<Node | null>(null);
  const [currentPolylinePoints, setCurrentPolylinePoints] = useState<PolylinePoint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentJunction, setCurrentJunction] = useState<Junction | null>(null);

  const clickingNode = async (nodeId: number) => {
    try {
      const response = await axios.get(`http://localhost:3001/nodes/${nodeId}`);
      const junction = response.data.junction;
      setCurrentJunction(junction);
      setIsModalOpen(true);
      
   } catch (error) {
      console.log('Error fetching nodes:', error);
   }
  }

  const updateJunction = async (junctionId: number, updatedData: Partial<Junction>) => {
    try {
      await axios.patch(`http://localhost:3001/junctions/${junctionId}`, updatedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsModalOpen(false); 
    } catch (error) {
      console.error('Error updating junction:', error);
    }
  };

  
  const addNodeToEpanet = (node: EpanetNode) => {
    const { id, type } = node;
    let nodeType;

    if (type === 'junction') {
        nodeType = NodeType.Junction;
    } else if (type === 'reservoir') {
        nodeType = NodeType.Reservoir;
    } else if (type === 'tank') {
        nodeType = NodeType.Tank;
    } else {
        console.error(`Unknown node type: ${type}`);
        return;
    }

    model.addNode(id.toString(), nodeType);
};


  const fetchNode = async () => {
    try {
       const response = await axios.get('http://localhost:3001/nodes');
       const nodeData = response.data;
       setNodes(nodeData);

       model.init("report.rpt", "out.bin", 0, 0);
       nodeData.forEach(addNodeToEpanet);
    } catch (error) {
       console.log('Error fetching nodes:', error);
    }
  } 

    useEffect(() => {    
      fetchNode();
    },[])
  
  const addNode = async (latlng: L.LatLng, type: string) => { 
    try {
      const response = await axios.post('http://localhost:3001/nodes', {
          type: type,
          longitude: latlng.lng,
          latitude: latlng.lat,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const nodeId = response.data.id;

      if(type === 'junction') {
        await axios.post('http://localhost:3001/junctions', {
          nodeId: nodeId,
          elevation: 0.00,
          demand: 0.00, 
          demandPattern: ""
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        })
      } else if (type === 'tank') {
        await axios.post('http://localhost:3001/tanks', {
          nodeId: nodeId,
          elevation: 0.00,
          initialLevel: 0.00,
          minimumLevel: 0.00,
          maximumLevel: 0.00,
          diameter: 0.00,
          minimumVolume: 0.00, 
          volumeCurve: ""
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        })
      }
        


    } catch (error) {
      console.log(error)
    }

    fetchNode();

  };

const addLinkToEpanet = (startNodeId: string, endNodeId: string, linkType: string) => {
  let linkIndex: number;

  const linkId = links.length + 1

  if (linkType === 'pipe') {
    // Assuming linkParams contains necessary parameters for a pipe, like length, diameter, and roughness
    linkIndex = model.addLink(linkId.toString(), LinkType.Pipe, startNodeId, endNodeId);
    model.setLinkValue(linkIndex, LinkProperty.Length, 100);
    
    console.log(model.getLinkValue(linkIndex, LinkProperty.Length))
  } 
  else if (linkType === 'pump') {
    // Assuming linkParams contains necessary parameters for a pipe, like length, diameter, and roughness
    linkIndex = model.addLink(linkId.toString(), LinkType.Pipe, startNodeId, endNodeId);
    model.setLinkValue(linkIndex, LinkProperty.Length, 50);
    
    console.log(model.getLinkValue(linkIndex, LinkProperty.Length))
  }
  // Include conditions for other types of links (pumps, valves) with their specific parameters

  const linkCount = model.getCount(CountType.LinkCount);
  console.log(`Link added. Total links: ${linkCount}`);
};

 

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (selectedNodeType) {
          addNode(e.latlng, selectedNodeType);
        }
        if (selectedLinkType) {
          // If a link type is selected and we have a starting node, we're in 'drawing mode'
          if (linkStartNode) {
            // Add the clicked point to the current polyline
            setCurrentPolylinePoints(currentPoints => [...currentPoints, { latitude: e.latlng.lat, longitude: e.latlng.lng }]);
          } else {
            // If we don't have a starting node, set the current node as the starting node
            const fromNode = {
              id: nodes.length + 1, // The new node's ID will be the next in the sequence
              latitude: e.latlng.lat,
              longitude: e.latlng.lng,
              name: `Node${nodes.length + 1}`,
              type: selectedNodeType,
            };
            setLinkStartNode(fromNode);
            setCurrentPolylinePoints(points => [...points, { latitude: fromNode.latitude, longitude: fromNode.longitude }]); // Start the polyline with the new node position
          }
        }
      },
      // ... [Other event handlers remain unchanged] ...
    });
    
    return null;
  };  

  const finishPolyline = (toNode: Node) => {
    if (currentPolylinePoints.length > 0) {
      // Add the final node to the current polyline
      // 

      const updatedPolylinePoints = [...currentPolylinePoints, { latitude: toNode.latitude, longitude: toNode.longitude }];

      const newLink: Link = {
        id: links.length + 1,
        positions: updatedPolylinePoints,
        name: `Link${links.length + 1}`,
        type: selectedLinkType, 
      };
      setLinks(prevLinks => [...prevLinks, newLink]);
      
      if (linkStartNode) {
        addLinkToEpanet(linkStartNode.id.toString(), toNode.id.toString(), selectedLinkType);
      }

      // Reset the current polyline
      setCurrentPolylinePoints([]);
      setLinkStartNode(null);
      setSelectedLinkType('');
    }
  };
  

  const handleNodeClick = (node: Node) => {
    if (selectedLinkType) {
      if (!linkStartNode) {
        // Select the start node for the link
        setLinkStartNode(node);
        setCurrentPolylinePoints([{ latitude: node.latitude, longitude: node.longitude }]); // Start the polyline with the start node position
      } else {
        // Finish the polyline with the current node as the toNode
        finishPolyline(node);
      }
    }
  };

  
  const iconUrls: { [key in MapNodeType]: string } = {
    tank: "https://cdn-icons-png.flaticon.com/512/8018/8018594.png",
    reservoir: "https://cdn-icons-png.flaticon.com/512/3453/3453697.png", // Replace with actual URL
    junction: "https://creazilla-store.fra1.digitaloceanspaces.com/emojis/57700/purple-circle-emoji-clipart-xl.png", // Replace with actual URL
  };
  
  // Function to get a custom icon based on the node type
const getCustomIcon = (type: MapNodeType) => {
  return new Icon({
    iconUrl: iconUrls[type], 
    iconSize: [20, 20],
  });
};

  return (
    <>
    <SidePanel onSelectNodeType={(nodeType) => {
      setSelectedNodeType(nodeType)
      setSelectedLinkType(''); 
    }} onSelectLinkType={(linkType) => {
      setSelectedLinkType(linkType);
      setSelectedNodeType('');
    }}/>

    {}
    <JunctionModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      junction={currentJunction}
      onUpdate={updateJunction}
    />

    <MapContainer center={defaultPosition} zoom={zoomLevel} zoomControl={false} style={{ height: '100vh', width: '100%' }}>
      <TileLayer 
      attribution='Stadia ALdidadeSmoothDark'
      url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
      />
      <MapEvents />
      {nodes.map((node) => (
        <Marker icon={getCustomIcon(node.type as MapNodeType)}  key={node.id} position={[node.latitude, node.longitude]} 
        // eventHandlers={{ click: () => handleNodeClick(node) }}
        eventHandlers={{ click: () => clickingNode(node.id)}}
        >
        </Marker>
      ))}
      {links.map((link) => (
        <Polyline key={link.id} positions={link.positions.map(p => [p.latitude, p.longitude])} weight={3} color="blue">
        </Polyline>
      ))}
      {currentPolylinePoints.length > 0 && (
        <Polyline positions={currentPolylinePoints.map(p => [p.latitude, p.longitude])} color="blue" weight={3} />
      )}
      
    </MapContainer>
    </>
  );
};

export default Map1; 