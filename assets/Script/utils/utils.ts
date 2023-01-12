import CellCtrl from '../ui/game/cell';
import { MoveState } from '../ui/game/gameTypes'
import { COL_COUNT, CLEAR_NUM } from './config';

export function getIndex(row: number, col: number) {
    return row * COL_COUNT + col;
}

export function getRowAndCol(index: number) {
    return {
        row: Math.floor(index / COL_COUNT),
        col: index % COL_COUNT
    };
}

// 检查棋子是否相临
export function checkAdjacent(cell1: CellCtrl, cell2: CellCtrl) {
    if (cell1.row === cell2.row) {
        if (cell1.col + 1 === cell2.col || cell1.col - 1 === cell2.col) {
            return MoveState.Horizontal;
        }
    } else if (cell1.col === cell2.col) {
        if (cell1.row + 1 === cell2.row || cell1.row - 1 === cell2.row) {
            return MoveState.Vertical;
        }
    }
    return MoveState.None;
}

export function trySwapAndClear(cell: CellCtrl, cellIdTable: number[][]) {
    let result = trySwapRightAndClear(cell, cellIdTable);
    if (result) {
        return true;
    }
    result = trySwapLeftAndClear(cell, cellIdTable);
    if (result) {
        return true;
    }
    result = trySwapUpAndClear(cell, cellIdTable);
    if (result) {
        return true;
    }
    return trySwapDownAndClear(cell, cellIdTable);
}

// 先和右边棋子交换之后再尝试消除
export function trySwapRightAndClear(cell: CellCtrl, cellIdTable: number[][]) {
    const { row, col, id, index } = cell;
    const tempTable = cellIdTable.map((item) => item.map((item) => item));
    const rightCol = col + 1;
    if (!tempTable[rightCol]) {
        return false;
    }
    const temp = id;
    tempTable[col][row] = tempTable[rightCol][row];
    tempTable[rightCol][row] = temp;
    const horizontalClearCells = new Set<number>([index]);
    const verticalClearCells = new Set<number>([index]);
    tryClearHorizontal(row, col, tempTable[col][row], tempTable, horizontalClearCells);
    tryClearVertical(row, col, tempTable[col][row], tempTable, verticalClearCells);
    if (horizontalClearCells.size >= CLEAR_NUM || verticalClearCells.size >= CLEAR_NUM) {
        return true;
    }
    return false;
}

// 先和左边棋子交换之后再尝试消除
export function trySwapLeftAndClear(cell: CellCtrl, cellIdTable: number[][]) {
    const { row, col, id, index } = cell;
    const tempTable = cellIdTable.map((item) => item.map((item) => item));
    const leftCol = col - 1;
    if (!tempTable[leftCol]) {
        return false;
    }
    const temp = id;
    tempTable[col][row] = tempTable[leftCol][row];
    tempTable[leftCol][row] = temp;
    const horizontalClearCells = new Set<number>([index]);
    const verticalClearCells = new Set<number>([index]);
    tryClearHorizontal(row, col, tempTable[col][row], tempTable, horizontalClearCells);
    tryClearVertical(row, col, tempTable[col][row], tempTable, verticalClearCells);
    if (horizontalClearCells.size >= CLEAR_NUM || verticalClearCells.size >= CLEAR_NUM) {
        return true;
    }
    return false;
}

// 先和上边棋子交换之后再尝试消除
export function trySwapUpAndClear(cell: CellCtrl, cellIdTable: number[][]) {
    const { row, col, id, index } = cell;
    const tempTable = cellIdTable.map((item) => item.map((item) => item));
    const upRow = row - 1;
    if (tempTable[col][upRow] === undefined) {
        return false;
    }
    const temp = id;
    tempTable[col][row] = tempTable[col][upRow];
    tempTable[col][upRow] = temp;
    const horizontalClearCells = new Set<number>([index]);
    const verticalClearCells = new Set<number>([index]);
    tryClearHorizontal(row, col, tempTable[col][row], tempTable, horizontalClearCells);
    tryClearVertical(row, col, tempTable[col][row], tempTable, verticalClearCells);
    if (horizontalClearCells.size >= CLEAR_NUM || verticalClearCells.size >= CLEAR_NUM) {
        return true;
    }
    return false;
}

// 先和下边棋子交换之后再尝试消除
export function trySwapDownAndClear(cell: CellCtrl, cellIdTable: number[][]) {
    const { row, col, id, index } = cell;
    const tempTable = cellIdTable.map((item) => item.map((item) => item));
    const downRow = row + 1;
    if (tempTable[col][downRow] === undefined) {
        return false;
    }
    const temp = id;
    tempTable[col][row] = tempTable[col][downRow];
    tempTable[col][downRow] = temp;
    const horizontalClearCells = new Set<number>([index]);
    const verticalClearCells = new Set<number>([index]);
    tryClearHorizontal(row, col, tempTable[col][row], tempTable, horizontalClearCells);
    tryClearVertical(row, col, tempTable[col][row], tempTable, verticalClearCells);
    if (horizontalClearCells.size >= CLEAR_NUM || verticalClearCells.size >= CLEAR_NUM) {
        return true;
    }
    return false;
}

// 检查是否可消除
export function tryClear(cell: CellCtrl, cellIdTable: number[][]) {
    const { row, col, id, index } = cell;
    const horizontalClearCells = new Set<number>([index]);
    const verticalClearCells = new Set<number>([index]);
    tryClearHorizontal(row, col, id, cellIdTable, horizontalClearCells);
    tryClearVertical(row, col, id, cellIdTable, verticalClearCells);
    return {
        horizontal: horizontalClearCells,
        vertical: verticalClearCells
    };
}

// 检查横排是否可消除
export function tryClearHorizontal(row: number, col: number, id: number, cellIdTable: number[][], clearCells: Set<number>) {
    const left = cellIdTable[col - 1] ? cellIdTable[col - 1][row] : null;
    const leftIndex = getIndex(row, col - 1);
    if (left === id && !clearCells.has(leftIndex)) {
        clearCells.add(leftIndex);
        tryClearHorizontal(row, col - 1, id, cellIdTable, clearCells);
    }

    const right = cellIdTable[col + 1] ? cellIdTable[col + 1][row] : null;
    const rightIndex = getIndex(row, col + 1);
    if (right === id && !clearCells.has(rightIndex)) {
        clearCells.add(rightIndex);
        tryClearHorizontal(row, col + 1, id, cellIdTable, clearCells);
    }
}

// 检查竖排是否可消除
export function tryClearVertical(row: number, col: number, id: number, cellIdTable: number[][], clearCells: Set<number>) {
    const up = cellIdTable[col][row - 1];
    const upIndex = getIndex(row - 1, col);
    if (up === id && !clearCells.has(upIndex)) {
        clearCells.add(upIndex);
        tryClearVertical(row - 1, col, id, cellIdTable, clearCells);
    }

    const down = cellIdTable[col][row + 1];
    const downIndex = getIndex(row + 1, col);
    if (down === id && !clearCells.has(downIndex)) {
        clearCells.add(downIndex);
        tryClearVertical(row + 1, col, id, cellIdTable, clearCells);
    }
}


// 收集可消除的棋子，按列分布
export function buildClearColMap(cell: CellCtrl, cellIdTable: number[][], clearColMap: Map<number, number[]>) {
    const { horizontal, vertical } = tryClear(cell, cellIdTable);
     if (vertical.size >= CLEAR_NUM) {
        const arr = [...vertical];
        const { col } = getRowAndCol(arr[0]);
        if (clearColMap.has(col)) {
            const cells = new Set(clearColMap.get(col));
            arr.forEach((item) => cells.add(item));
            clearColMap.set(col, [...cells].sort((a, b) => a - b));
        } else {
            clearColMap.set(col, arr.sort((a, b) => a - b));
        }
    }
    if (horizontal.size >= CLEAR_NUM) {
        horizontal.forEach((item) => {
            const { col } = getRowAndCol(item);
            if (clearColMap.has(col)) {
                const cells = new Set(clearColMap.get(col));
                if (!cells.has(item)) {
                    cells.add(item);
                    clearColMap.set(col, [...cells].sort((a, b) => a - b));
                }
            } else {
                clearColMap.set(col, [item]);
            }
        });
    }
}