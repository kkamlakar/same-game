import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgStyle, NgFor } from '@angular/common';

interface Tile {
  color: string;
  removed: boolean;
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
  lastGridState: Tile[][] | null = null;  // <-- Add this

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

  getRemainingTiles(): number {
  return this.grid.flat().filter(tile => !tile.removed && tile.color).length;
}
  ngOnInit(): void {
    this.initGrid();
  }

  initGrid(): void {
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
    const target = this.grid[row][col];
    if (target.removed) return;

    const connected = this.getConnectedTiles(row, col, target.color);
    if (connected.length >= 2) {
      // Save current grid for undo
      this.lastGridState = this.grid.map(row => row.map(tile => ({...tile})));

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

    if (this.isGameOver()) {
      setTimeout(() => alert('Game Over! No more moves available.'), 100);
    }
  }

  isGameOver(): boolean {
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

  undo(): void {
  if (this.lastGridState) {
    this.grid = this.lastGridState.map(row => row.map(tile => ({ ...tile })));
    this.lastGridState = null;
  } else {
    alert('Nothing to undo');
  }
}

}
