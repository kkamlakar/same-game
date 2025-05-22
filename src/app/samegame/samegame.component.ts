import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgStyle, NgFor } from '@angular/common';

interface Tile {
  color: string;
  removed: boolean;
  hoverGroup?: boolean; // for visual feedback
}

@Component({
  selector: 'app-samegame',
  standalone: true,
  imports: [NgStyle, NgFor, CommonModule],
  templateUrl: './samegame.component.html',
  styleUrls: ['./samegame.component.css']
})
export class SameGameComponent implements OnInit {
  grid: Tile[][] = [];
  rows = 10;
  cols = 10;
  colors = ['red', 'blue', 'green', 'yellow', 'purple'];
  lastGridState: Tile[][] | null = null;
  hoveredGroup: [number, number][] = [];
  isGameOver: boolean = false;  // <-- Add this

  ngOnInit(): void {
    this.initGrid();
  }

  initGrid(): void {
    this.isGameOver = false; // Reset game over status on new game
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({ color: this.randomColor(), removed: false });
      }
      this.grid.push(row);
    }
  }

  randomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  onTileClick(row: number, col: number): void {
    if (this.isGameOver) return; // Prevent clicks after game over

    const target = this.grid[row][col];
    if (target.removed) return;

    const connected = this.getConnectedTiles(row, col, target.color);
    if (connected.length >= 2) {
      this.lastGridState = this.grid.map(row => row.map(tile => ({ ...tile })));

      connected.forEach(([r, c]) => this.grid[r][c].removed = true);
      this.collapseTiles();
    }
  }

  getConnectedTiles(row: number, col: number, color: string, visited = new Set<string>()): [number, number][] {
    const key = `${row},${col}`;
    if (visited.has(key)) return [];
    if (
      row < 0 || col < 0 || row >= this.rows || col >= this.cols ||
      this.grid[row][col].color !== color || this.grid[row][col].removed
    ) return [];

    visited.add(key);
    let result: [number, number][] = [[row, col]];

    for (const [dr, dc] of [[0,1],[1,0],[-1,0],[0,-1]]) {
      result = result.concat(this.getConnectedTiles(row + dr, col + dc, color, visited));
    }

    return result;
  }

  collapseTiles(): void {
    // Collapse columns vertically
    for (let c = 0; c < this.cols; c++) {
      const newCol = this.grid.map(row => row[c]).filter(tile => !tile.removed);
      const emptyTiles = Array.from({ length: this.rows - newCol.length }, () => ({ color: '', removed: true }));
      for (let r = 0; r < this.rows; r++) {
        this.grid[r][c] = r < emptyTiles.length ? emptyTiles[r] : newCol[r - emptyTiles.length];
      }
    }

    // Collapse columns horizontally (shift left)
    let newGrid: Tile[][] = [];
    for (let c = 0; c < this.cols; c++) {
      if (this.grid.some(row => !row[c].removed)) {
        newGrid.push(this.grid.map(row => row[c]));
      }
    }

    // Transpose back to grid
    const finalGrid: Tile[][] = [];
    for (let r = 0; r < this.rows; r++) {
      finalGrid[r] = [];
      for (let c = 0; c < newGrid.length; c++) {
        finalGrid[r][c] = newGrid[c][r];
      }
      for (let c = newGrid.length; c < this.cols; c++) {
        finalGrid[r][c] = { color: '', removed: true };
      }
    }

    this.grid = finalGrid;

    if (this.isGameOverCheck()) {
      // Instead of alert, set flag to show popup
      this.isGameOver = true;
    }
  }

  getRemainingTiles(): number {
  return this.grid.flat().filter(tile => !tile.removed && tile.color).length;
}

  getRemainingTilesByColor(): { [color: string]: number } {
    const counts: { [color: string]: number } = {};
    for (const row of this.grid) {
      for (const tile of row) {
        if (!tile.removed && tile.color) {
          counts[tile.color] = (counts[tile.color] || 0) + 1;
        }
      }
    }
    return counts;
  }

  isGameOverCheck(): boolean {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tile = this.grid[r][c];
        if (!tile.removed) {
          const connected = this.getConnectedTiles(r, c, tile.color);
          if (connected.length >= 2) {
            return false; // moves still available
          }
        }
      }
    }
    return true; // no moves left
  }

  restartGame(): void {
    this.initGrid(); // Reset the grid and game state
  }

  undo(): void {
    if (this.lastGridState) {
      this.grid = this.lastGridState.map(row => row.map(tile => ({ ...tile })));
      this.lastGridState = null;
      this.isGameOver = false;
    } else {
      alert('Nothing to undo');
    }
  }
onTileHover(row: number, col: number): void {
  const tile = this.grid[row][col];
  if (tile.removed) {
    this.hoveredGroup = [];
    return;
  }

  const group = this.getConnectedTiles(row, col, tile.color);
  this.hoveredGroup = group.length >= 2 ? group : [];
}

onTileLeave(): void {
  this.hoveredGroup = [];
}

isHovered(row: number, col: number): boolean {
  return this.hoveredGroup.some(([r, c]) => r === row && c === col);
}


findConnectedGroup(r: number, c: number, color: string): [number, number][] {
  const visited = new Set<string>();
  const group: [number, number][] = [];

  const stack: [number, number][] = [[r, c]];
  const isValid = (i: number, j: number) =>
    i >= 0 &&
    j >= 0 &&
    i < this.grid.length &&
    j < this.grid[0].length &&
    !this.grid[i][j].removed &&
    this.grid[i][j].color === color &&
    !visited.has(`${i},${j}`);

  while (stack.length) {
    const [i, j] = stack.pop()!;
    if (!isValid(i, j)) continue;

    visited.add(`${i},${j}`);
    group.push([i, j]);

    stack.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]);
  }

  return group;
}

}

