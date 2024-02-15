// import { saveAs } from 'file-saver';

// const saveNetworkAsINP = (nodes: Node[], links: Link[]) => {
//   let inpFileContent = '[TITLE]\n;;Title/Notes\n\n[JUNCTIONS]\n;;ID\tElev\tDemand\tPattern\n';
//   // Add junctions data
//   nodes.forEach(node => {
//     // Assuming `node` has an `id`, `elevation`, and `demand`
//     inpFileContent += `${node.id}\t${node.elevation}\t${node.demand}\t;\n`;
//   });
//   // Continue with [PIPES], [RESERVOIRS], [PUMPS], etc., according to your data structure

//   // Finally, use FileSaver to save the file
//   const blob = new Blob([inpFileContent], { type: 'text/plain;charset=utf-8' });
//   saveAs(blob, 'network.inp');
// };