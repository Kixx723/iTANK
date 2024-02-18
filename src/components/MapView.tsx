import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, LatLngExpression} from 'leaflet';
import SidePanel from './SidePanel';
import { Project, Workspace, NodeType, NodeProperty, CountType, LinkType, LinkProperty } from "epanet-js";
import axios from 'axios';
// import { EditControl } from 'react-leaflet-draw';
// import 'leaflet-draw/dist/leaflet.draw.css'

interface Node {
    id: number;
    longitude: number; 
    latitude: number; 
    type: string;
}

interface Link {
  id: number;
  positions: { latitude: number; longitude: number; }[];
  name?: string,
  type: string,
}

interface PolylinePoint {
  latitude: number;
  longitude: number;
}

const ws = new Workspace();
const model = new Project(ws);

model.init("report.rpt", "out.bin", 0, 0);

type MapNodeType = 'tank' | 'reservoir' | 'junction';


const Map1: React.FC = () => {
  const defaultPosition: LatLngExpression = [6.1164, 125.1716]; 
  const zoomLevel: number = 13;
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNodeType, setSelectedNodeType] = useState<string>('');
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedLinkType, setSelectedLinkType] = useState<string>('');
  const [linkStartNode, setLinkStartNode] = useState<Node | null>(null);
  const [currentPolylinePoints, setCurrentPolylinePoints] = useState<PolylinePoint[]>([]);


  const fetchNode = async () => {
    try {
       const response = await axios.get(`http://localhost:3001/nodes`);
       const nodeData = response.data;
       console.log(nodeData)
       setNodes(nodeData);
    } catch (error) {
       console.log('Error fetching nodes:', error);
    }
  } 

    useEffect(() => {    
      fetchNode();
    },[])
  
  
  const addNode = async (latlng: L.LatLng, type: string) => { 
    try {
      await axios.post(`http://localhost:3001/nodes`, {
          type: type,
          longitude: latlng.lng,
          latitude: latlng.lat,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.log(error)
    }
    fetchNode();
    // setNodes(prevNodes => [...prevNodes, newNode]);
    // if (type === 'junction' || type === 'tank' || type === 'reservoir') {
    //   addNodeToEpanet(type);
    // }
  };
  
//   const addNodeToEpanet = (type: string) => {
//     if (type === 'junction' || type === 'tank' || type === 'reservoir') {
  
//         const nodeId = nodes.length + 1;
//         let nodeType: number;
//         let nodeIndex: number;
//         if (type === 'junction') {
//             nodeType = NodeType.Junction;
//             nodeIndex = model.addNode(nodeId.toString(), nodeType);
//             const nodeData = model.getNodeId(nodeIndex)
//             console.log(nodeData)
//         }   
//         else if (type === 'reservoir') {
//             nodeType = NodeType.Reservoir;
//             nodeIndex = model.addNode(nodeId.toString(), nodeType);
//             // Set additional data as needed
//             const nodeData = model.getNodeId(nodeIndex)
//             console.log(nodeData)
//         }
//         else if (type === 'tank') {
//             nodeType = NodeType.Tank;
//             nodeIndex = model.addNode(nodeId.toString(), nodeType);
//             const nodeData = model.getNodeId(nodeIndex)
//             console.log(nodeData)
//         }
//         // Optionally, you can also store the node index or other data for future reference or database storage
//         // const nodeData = model.getNodeId(nodes.length + 1)
//         // console.log(nodeData)
//         // const nodeCount = model.getCount(CountType.NodeCount);
//         // console.log(nodeCount);
//         // console.log(nodeData);

//     }
// };

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
    reservoir: "https://cdn.iconscout.com/icon/premium/png-256-thumb/dug-well-973551.png", // Replace with actual URL
    junction: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Purple_Circle.png?20180518181543", // Replace with actual URL
  };
  
  // Function to get a custom icon based on the node type
const getCustomIcon = (type: MapNodeType) => {
  return new Icon({
    iconUrl: iconUrls[type], 
    iconSize: [25, 25],
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
    <MapContainer center={defaultPosition} zoom={zoomLevel} zoomControl={false} style={{ height: '100vh', width: '100%' }}>
      <TileLayer 
      attribution='Stadia ALdidadeSmoothDark'
      url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
      />
      <MapEvents />
      {nodes.map((node) => (
        <Marker icon={getCustomIcon(node.type as MapNodeType)}  key={node.id} position={[node.latitude, node.longitude]} eventHandlers={{ click: () => handleNodeClick(node) }}>
        </Marker>
      ))}
      {links.map((link) => (
        <Polyline key={link.id} positions={link.positions.map(p => [p.latitude, p.longitude])} weight={5} color="blue">
        </Polyline>
      ))}
      {currentPolylinePoints.length > 0 && (
        <Polyline positions={currentPolylinePoints.map(p => [p.latitude, p.longitude])} color="blue" weight={5} />
      )}
      
    </MapContainer>
    </>
  );
};

export default Map1; 