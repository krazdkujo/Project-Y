/**
 * Dungeon Generator
 * 
 * Core procedural dungeon generation system implementing various algorithms
 * for creating diverse dungeon layouts and themes.
 */

import { 
  DungeonConfig, 
  DungeonMap, 
  GeneratedDungeon, 
  DungeonCell, 
  DungeonRoom, 
  CellType,
  DungeonMetadata,
  Room,
  Corridor
} from '../../shared/DungeonTypes';

export class DungeonGenerator {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Math.floor(Math.random() * 1000000);
  }

  // Seeded random number generator for consistent results
  private seededRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  public generate(config: DungeonConfig): GeneratedDungeon {
    return this.generateDungeon(config);
  }

  public generateDungeon(config: DungeonConfig): GeneratedDungeon {
    const map = this.generateMap(config);
    const rooms = this.generateRooms(config);
    const corridors = this.generateCorridors(rooms);
    
    const metadata: DungeonMetadata = {
      generatedAt: new Date(),
      config,
      stats: {
        roomCount: rooms.length,
        corridorLength: corridors.reduce((total, corridor) => total + corridor.path.length, 0),
        connectivity: this.calculateConnectivity(rooms, corridors)
      }
    };

    return {
      success: true,
      map,
      metadata,
      rooms,
      corridors,
      config
    };
  }

  private generateMap(config: DungeonConfig): DungeonMap {
    const cells: DungeonCell[][] = [];
    
    // Initialize with walls
    for (let x = 0; x < config.width; x++) {
      cells[x] = [];
      for (let y = 0; y < config.height; y++) {
        cells[x][y] = {
          type: 'wall',
          x,
          y
        };
      }
    }

    // Generate rooms first
    const rooms = this.generateRoomsForMap(config);
    
    // Apply generation algorithm with rooms
    switch (config.algorithm) {
      case 'bsp':
        this.applyImprovedBSPAlgorithm(cells, config, rooms);
        break;
      case 'cellular_automata':
        this.applyImprovedCellularAutomata(cells, config);
        break;
      case 'rooms_corridors':
      default:
        this.applyImprovedRoomsAndCorridors(cells, config, rooms);
        break;
    }

    // Add dungeon features
    this.addDungeonFeatures(cells, rooms, config);
    
    // Place entrance and exit
    this.placeEntranceAndExit(cells, rooms);

    return {
      width: config.width,
      height: config.height,
      cells,
      rooms: rooms.map(r => ({
        id: r.id,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        connected: r.connected
      })),
      theme: config.theme,
      algorithm: config.algorithm,
      seed: this.seed
    };
  }

  private generateRooms(config: DungeonConfig): Room[] {
    const rooms: Room[] = [];
    const roomCount = config.roomCount ?? 8;
    
    for (let i = 0; i < roomCount; i++) {
      const room: Room = {
        id: `room_${i}`,
        x: Math.floor(Math.random() * (config.width - 10)) + 2,
        y: Math.floor(Math.random() * (config.height - 10)) + 2,
        width: (config.roomMinSize ?? 4) + Math.floor(Math.random() * ((config.roomMaxSize ?? 8) - (config.roomMinSize ?? 4))),
        height: (config.roomMinSize ?? 4) + Math.floor(Math.random() * ((config.roomMaxSize ?? 8) - (config.roomMinSize ?? 4))),
        connected: false,
        type: i === 0 ? 'entrance' : i === roomCount - 1 ? 'exit' : 'normal'
      };
      rooms.push(room);
    }

    return rooms;
  }

  private generateRoomsForMap(config: DungeonConfig): Room[] {
    const rooms: Room[] = [];
    const roomCount = Math.min(config.roomCount ?? 8, 10); // Cap at 10 rooms
    const minRoomSize = config.roomMinSize ?? 4;
    const maxRoomSize = config.roomMaxSize ?? 12;
    const attempts = 500; // Maximum attempts to place rooms
    
    for (let i = 0; i < roomCount; i++) {
      let placed = false;
      let attempt = 0;
      
      while (!placed && attempt < attempts) {
        const width = minRoomSize + Math.floor(this.seededRandom() * (maxRoomSize - minRoomSize + 1));
        const height = minRoomSize + Math.floor(this.seededRandom() * (maxRoomSize - minRoomSize + 1));
        const x = 2 + Math.floor(this.seededRandom() * (config.width - width - 4));
        const y = 2 + Math.floor(this.seededRandom() * (config.height - height - 4));
        
        const newRoom: Room = {
          id: `room_${i}`,
          x,
          y,
          width,
          height,
          connected: false,
          type: i === 0 ? 'entrance' : i === roomCount - 1 ? 'exit' : 'normal'
        };
        
        // Check if room overlaps with existing rooms (with buffer)
        const buffer = 1;
        let overlaps = false;
        for (const existingRoom of rooms) {
          if (!(newRoom.x + newRoom.width + buffer < existingRoom.x ||
                newRoom.x > existingRoom.x + existingRoom.width + buffer ||
                newRoom.y + newRoom.height + buffer < existingRoom.y ||
                newRoom.y > existingRoom.y + existingRoom.height + buffer)) {
            overlaps = true;
            break;
          }
        }
        
        if (!overlaps) {
          rooms.push(newRoom);
          placed = true;
        }
        attempt++;
      }
    }
    
    return rooms;
  }

  private generateCorridors(rooms: Room[]): Corridor[] {
    const corridors: Corridor[] = [];
    
    for (let i = 0; i < rooms.length - 1; i++) {
      const corridor: Corridor = {
        id: `corridor_${i}`,
        startRoom: rooms[i].id,
        endRoom: rooms[i + 1].id,
        path: this.calculatePath(rooms[i], rooms[i + 1]),
        width: 1
      };
      corridors.push(corridor);
    }

    return corridors;
  }

  private calculatePath(roomA: Room, roomB: Room): { x: number; y: number }[] {
    const path: { x: number; y: number }[] = [];
    const startX = roomA.x + Math.floor(roomA.width / 2);
    const startY = roomA.y + Math.floor(roomA.height / 2);
    const endX = roomB.x + Math.floor(roomB.width / 2);
    const endY = roomB.y + Math.floor(roomB.height / 2);

    // Simple L-shaped path
    let currentX = startX;
    let currentY = startY;

    // Move horizontally first
    while (currentX !== endX) {
      path.push({ x: currentX, y: currentY });
      currentX += currentX < endX ? 1 : -1;
    }

    // Then move vertically
    while (currentY !== endY) {
      path.push({ x: currentX, y: currentY });
      currentY += currentY < endY ? 1 : -1;
    }

    path.push({ x: endX, y: endY });
    return path;
  }

  private calculateConnectivity(rooms: Room[], corridors: Corridor[]): number {
    // Simple connectivity measure: ratio of corridors to rooms
    return corridors.length / Math.max(rooms.length, 1);
  }

  // Improved Algorithm implementations
  private applyImprovedBSPAlgorithm(cells: DungeonCell[][], config: DungeonConfig, rooms: Room[]): void {
    // BSP (Binary Space Partitioning) creates rooms in a tree structure
    const partitions = this.createBSPPartitions(config.width, config.height, rooms.length);
    
    // Place rooms within partitions
    for (let i = 0; i < Math.min(rooms.length, partitions.length); i++) {
      const partition = partitions[i];
      const room = rooms[i];
      
      // Adjust room to fit within partition if needed
      room.x = Math.max(partition.x + 1, room.x);
      room.y = Math.max(partition.y + 1, room.y);
      room.width = Math.min(room.width, partition.width - 2);
      room.height = Math.min(room.height, partition.height - 2);
      
      this.carveRoom(cells, room);
    }

    // Connect rooms with corridors
    this.connectRoomsWithCorridors(cells, rooms);
  }

  private applyImprovedCellularAutomata(cells: DungeonCell[][], config: DungeonConfig): void {
    const iterations = config.iterations ?? 5;
    const fillPercent = config.fillPercent ?? 45;

    // Initialize with random noise
    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        if (this.seededRandom() * 100 < fillPercent) {
          cells[x][y].type = 'floor';
        }
      }
    }

    // Apply cellular automata rules multiple times
    for (let i = 0; i < iterations; i++) {
      this.applyCellularAutomataStep(cells, config);
    }

    // Clean up isolated areas
    this.cleanupIsolatedAreas(cells, config);
  }

  private applyImprovedRoomsAndCorridors(cells: DungeonCell[][], config: DungeonConfig, rooms: Room[]): void {
    // Carve out all rooms
    for (const room of rooms) {
      this.carveRoom(cells, room);
    }
    
    // Connect all rooms with corridors
    this.connectRoomsWithCorridors(cells, rooms);
  }

  private createBSPPartitions(width: number, height: number, targetCount: number): Array<{x: number, y: number, width: number, height: number}> {
    const partitions: Array<{x: number, y: number, width: number, height: number}> = [];
    const queue = [{x: 0, y: 0, width, height}];
    
    while (queue.length > 0 && partitions.length + queue.length < targetCount * 2) {
      const current = queue.shift()!;
      
      if (current.width < 12 || current.height < 8) {
        partitions.push(current);
        continue;
      }
      
      const splitHorizontal = this.seededRandom() > 0.5;
      
      if (splitHorizontal && current.height >= 16) {
        const splitY = Math.floor(current.height * (0.3 + this.seededRandom() * 0.4));
        queue.push({x: current.x, y: current.y, width: current.width, height: splitY});
        queue.push({x: current.x, y: current.y + splitY, width: current.width, height: current.height - splitY});
      } else if (!splitHorizontal && current.width >= 20) {
        const splitX = Math.floor(current.width * (0.3 + this.seededRandom() * 0.4));
        queue.push({x: current.x, y: current.y, width: splitX, height: current.height});
        queue.push({x: current.x + splitX, y: current.y, width: current.width - splitX, height: current.height});
      } else {
        partitions.push(current);
      }
    }
    
    // Add remaining queue items to partitions
    partitions.push(...queue);
    return partitions;
  }

  private carveRoom(cells: DungeonCell[][], room: Room): void {
    for (let x = room.x; x < Math.min(room.x + room.width, cells.length); x++) {
      for (let y = room.y; y < Math.min(room.y + room.height, cells[0].length); y++) {
        if (x >= 0 && y >= 0 && x < cells.length && y < cells[0].length) {
          cells[x][y].type = 'floor';
        }
      }
    }
  }

  private connectRoomsWithCorridors(cells: DungeonCell[][], rooms: Room[]): void {
    if (rooms.length < 2) return;

    // Create minimum spanning tree to connect all rooms
    const connections = this.createMinimumSpanningTree(rooms);
    
    // Carve corridors for each connection
    for (const connection of connections) {
      const startRoom = rooms.find(r => r.id === connection.from);
      const endRoom = rooms.find(r => r.id === connection.to);
      
      if (startRoom && endRoom) {
        this.carveCorridorBetweenRooms(cells, startRoom, endRoom);
        startRoom.connected = true;
        endRoom.connected = true;
      }
    }

    // Add some extra connections for interesting loops (30% chance per room pair)
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 2; j < rooms.length; j++) {
        if (this.seededRandom() < 0.3) {
          this.carveCorridorBetweenRooms(cells, rooms[i], rooms[j]);
        }
      }
    }
  }

  private createMinimumSpanningTree(rooms: Room[]): Array<{from: string, to: string, distance: number}> {
    const connections: Array<{from: string, to: string, distance: number}> = [];
    const connected = new Set<string>([rooms[0].id]);
    const candidates: Array<{from: string, to: string, distance: number}> = [];

    // Initialize candidates from first room
    for (let i = 1; i < rooms.length; i++) {
      const distance = this.getDistance(rooms[0], rooms[i]);
      candidates.push({from: rooms[0].id, to: rooms[i].id, distance});
    }

    while (connected.size < rooms.length && candidates.length > 0) {
      // Find shortest connection to unconnected room
      candidates.sort((a, b) => a.distance - b.distance);
      let chosenConnection = null;

      for (const candidate of candidates) {
        if (!connected.has(candidate.to)) {
          chosenConnection = candidate;
          break;
        }
      }

      if (chosenConnection) {
        connections.push(chosenConnection);
        connected.add(chosenConnection.to);
        
        // Add new candidates from newly connected room
        const newRoom = rooms.find(r => r.id === chosenConnection.to);
        if (newRoom) {
          for (const room of rooms) {
            if (!connected.has(room.id)) {
              const distance = this.getDistance(newRoom, room);
              candidates.push({from: newRoom.id, to: room.id, distance});
            }
          }
        }

        // Remove processed candidate
        candidates.splice(candidates.indexOf(chosenConnection), 1);
      }
    }

    return connections;
  }

  private getDistance(room1: Room, room2: Room): number {
    const centerX1 = room1.x + Math.floor(room1.width / 2);
    const centerY1 = room1.y + Math.floor(room1.height / 2);
    const centerX2 = room2.x + Math.floor(room2.width / 2);
    const centerY2 = room2.y + Math.floor(room2.height / 2);
    
    return Math.sqrt(Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2));
  }

  private carveCorridorBetweenRooms(cells: DungeonCell[][], room1: Room, room2: Room): void {
    const start = {
      x: room1.x + Math.floor(room1.width / 2),
      y: room1.y + Math.floor(room1.height / 2)
    };
    const end = {
      x: room2.x + Math.floor(room2.width / 2),
      y: room2.y + Math.floor(room2.height / 2)
    };

    // Create L-shaped corridor with occasional variation
    const useCorner = this.seededRandom() > 0.5;
    
    if (useCorner) {
      // Horizontal first, then vertical
      this.carveHorizontalCorridor(cells, start.x, end.x, start.y);
      this.carveVerticalCorridor(cells, start.y, end.y, end.x);
    } else {
      // Vertical first, then horizontal
      this.carveVerticalCorridor(cells, start.y, end.y, start.x);
      this.carveHorizontalCorridor(cells, start.x, end.x, end.y);
    }
  }

  private carveHorizontalCorridor(cells: DungeonCell[][], startX: number, endX: number, y: number): void {
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    
    for (let x = minX; x <= maxX; x++) {
      if (x >= 0 && x < cells.length && y >= 0 && y < cells[0].length) {
        cells[x][y].type = 'floor';
        // Add corridor width for larger passages
        if (y - 1 >= 0 && this.seededRandom() > 0.7) {
          cells[x][y - 1].type = 'floor';
        }
        if (y + 1 < cells[0].length && this.seededRandom() > 0.7) {
          cells[x][y + 1].type = 'floor';
        }
      }
    }
  }

  private carveVerticalCorridor(cells: DungeonCell[][], startY: number, endY: number, x: number): void {
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    
    for (let y = minY; y <= maxY; y++) {
      if (x >= 0 && x < cells.length && y >= 0 && y < cells[0].length) {
        cells[x][y].type = 'floor';
        // Add corridor width for larger passages
        if (x - 1 >= 0 && this.seededRandom() > 0.7) {
          cells[x - 1][y].type = 'floor';
        }
        if (x + 1 < cells.length && this.seededRandom() > 0.7) {
          cells[x + 1][y].type = 'floor';
        }
      }
    }
  }

  private applyCellularAutomataStep(cells: DungeonCell[][], config: DungeonConfig): void {
    const newCells = JSON.parse(JSON.stringify(cells));

    for (let x = 1; x < config.width - 1; x++) {
      for (let y = 1; y < config.height - 1; y++) {
        const wallCount = this.countNeighboringWalls(cells, x, y);
        
        if (wallCount > 4) {
          newCells[x][y].type = 'wall';
        } else if (wallCount < 4) {
          newCells[x][y].type = 'floor';
        }
      }
    }

    // Copy results back
    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        cells[x][y] = newCells[x][y];
      }
    }
  }

  private countNeighboringWalls(cells: DungeonCell[][], x: number, y: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const nx = x + i;
        const ny = y + j;
        
        if (nx < 0 || nx >= cells.length || ny < 0 || ny >= cells[0].length) {
          count++;
        } else if (cells[nx][ny].type === 'wall') {
          count++;
        }
      }
    }
    return count;
  }

  private cleanupIsolatedAreas(cells: DungeonCell[][], config: DungeonConfig): void {
    const visited: boolean[][] = [];
    for (let x = 0; x < config.width; x++) {
      visited[x] = new Array(config.height).fill(false);
    }

    let largestArea = 0;
    let largestAreaCells: {x: number, y: number}[] = [];

    // Find all connected floor areas
    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        if (!visited[x][y] && cells[x][y].type === 'floor') {
          const area = this.floodFillArea(cells, visited, x, y, config);
          if (area.length > largestArea) {
            largestArea = area.length;
            largestAreaCells = area;
          }
        }
      }
    }

    // Convert all non-largest areas back to walls
    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        if (cells[x][y].type === 'floor' && !largestAreaCells.some(cell => cell.x === x && cell.y === y)) {
          cells[x][y].type = 'wall';
        }
      }
    }
  }

  private floodFillArea(cells: DungeonCell[][], visited: boolean[][], startX: number, startY: number, config: DungeonConfig): {x: number, y: number}[] {
    const area: {x: number, y: number}[] = [];
    const stack = [{x: startX, y: startY}];

    while (stack.length > 0) {
      const {x, y} = stack.pop()!;
      
      if (x < 0 || x >= config.width || y < 0 || y >= config.height || 
          visited[x][y] || cells[x][y].type !== 'floor') {
        continue;
      }

      visited[x][y] = true;
      area.push({x, y});

      // Add neighbors
      stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
    }

    return area;
  }

  private addDungeonFeatures(cells: DungeonCell[][], rooms: Room[], config: DungeonConfig): void {
    // Add doors at room entrances
    this.addDoors(cells, rooms);
    
    // Add water features
    this.addWaterFeatures(cells, rooms, config);
    
    // Add pillars in larger rooms
    this.addPillars(cells, rooms);
    
    // Add occasional traps
    this.addTraps(cells, rooms);
  }

  private addDoors(cells: DungeonCell[][], rooms: Room[]): void {
    for (const room of rooms) {
      const doorCandidates: {x: number, y: number}[] = [];
      
      // Find edges of room that connect to corridors
      for (let x = room.x; x < room.x + room.width; x++) {
        // Top edge
        if (room.y > 0 && cells[x][room.y - 1].type === 'floor') {
          doorCandidates.push({x, y: room.y - 1});
        }
        // Bottom edge
        if (room.y + room.height < cells[0].length - 1 && cells[x][room.y + room.height].type === 'floor') {
          doorCandidates.push({x, y: room.y + room.height});
        }
      }
      
      for (let y = room.y; y < room.y + room.height; y++) {
        // Left edge
        if (room.x > 0 && cells[room.x - 1][y].type === 'floor') {
          doorCandidates.push({x: room.x - 1, y});
        }
        // Right edge
        if (room.x + room.width < cells.length - 1 && cells[room.x + room.width][y].type === 'floor') {
          doorCandidates.push({x: room.x + room.width, y});
        }
      }

      // Place doors at some candidates (30% chance each)
      for (const candidate of doorCandidates) {
        if (this.seededRandom() < 0.3) {
          cells[candidate.x][candidate.y].type = 'door';
        }
      }
    }
  }

  private addWaterFeatures(cells: DungeonCell[][], rooms: Room[], config: DungeonConfig): void {
    const waterChance = 0.2; // 20% chance for water features
    
    for (const room of rooms) {
      if (this.seededRandom() < waterChance && room.width >= 6 && room.height >= 6) {
        // Add small water pool in corner
        const poolSize = 2 + Math.floor(this.seededRandom() * 3);
        const startX = room.x + 1 + Math.floor(this.seededRandom() * (room.width - poolSize - 1));
        const startY = room.y + 1 + Math.floor(this.seededRandom() * (room.height - poolSize - 1));
        
        for (let x = startX; x < startX + poolSize && x < room.x + room.width - 1; x++) {
          for (let y = startY; y < startY + poolSize && y < room.y + room.height - 1; y++) {
            if (x >= 0 && x < cells.length && y >= 0 && y < cells[0].length) {
              cells[x][y].type = 'water';
            }
          }
        }
      }
    }
  }

  private addPillars(cells: DungeonCell[][], rooms: Room[]): void {
    for (const room of rooms) {
      if (room.width >= 8 && room.height >= 8) {
        const pillarCount = 1 + Math.floor(this.seededRandom() * 3);
        
        for (let i = 0; i < pillarCount; i++) {
          const x = room.x + 2 + Math.floor(this.seededRandom() * (room.width - 4));
          const y = room.y + 2 + Math.floor(this.seededRandom() * (room.height - 4));
          
          if (x >= 0 && x < cells.length && y >= 0 && y < cells[0].length && cells[x][y].type === 'floor') {
            cells[x][y] = {
              type: 'wall',
              x,
              y,
              properties: { pillar: true }
            };
          }
        }
      }
    }
  }

  private addTraps(cells: DungeonCell[][], rooms: Room[]): void {
    const trapChance = 0.15; // 15% chance per room
    
    for (const room of rooms) {
      if (this.seededRandom() < trapChance) {
        const x = room.x + 1 + Math.floor(this.seededRandom() * (room.width - 2));
        const y = room.y + 1 + Math.floor(this.seededRandom() * (room.height - 2));
        
        if (x >= 0 && x < cells.length && y >= 0 && y < cells[0].length && cells[x][y].type === 'floor') {
          cells[x][y].type = 'trap';
        }
      }
    }
  }

  private placeEntranceAndExit(cells: DungeonCell[][], rooms: Room[]): void {
    if (rooms.length === 0) return;

    // Place entrance in first room
    const entranceRoom = rooms[0];
    const entranceX = entranceRoom.x + Math.floor(entranceRoom.width / 2);
    const entranceY = entranceRoom.y + Math.floor(entranceRoom.height / 2);
    
    if (entranceX >= 0 && entranceX < cells.length && entranceY >= 0 && entranceY < cells[0].length) {
      cells[entranceX][entranceY].type = 'stairs_up';
    }

    // Place exit in last room (or furthest room)
    if (rooms.length > 1) {
      const exitRoom = rooms[rooms.length - 1];
      if (exitRoom) {
        const exitX = exitRoom.x + Math.floor(exitRoom.width / 2);
        const exitY = exitRoom.y + Math.floor(exitRoom.height / 2);
        
        if (exitX >= 0 && exitX < cells.length && exitY >= 0 && exitY < cells[0].length) {
          cells[exitX][exitY].type = 'stairs_down';
        }
      }
    }
  }

  public dispose(): void {
    // Clean up any resources if needed
  }
}