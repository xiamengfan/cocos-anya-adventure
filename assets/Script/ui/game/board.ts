import { CellState, MoveState } from "./gameTypes";
import GameCtrl from "./game";
import CellCtrl from "./cell";
import { ROW_COUNT, COL_COUNT, CLEAR_NUM, STEP_NUM } from '../../utils/config';
import { checkAdjacent, tryClear, trySwapAndClear, getRowAndCol, buildClearColMap } from '../../utils/utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardCtrl extends cc.Component {

    gameCtrl: GameCtrl = null;

    @property(cc.Node)
    cellRoot: cc.Node = null;

    @property(cc.Prefab)
    prefabCell: cc.Prefab = null;

    // TODO: 移除node pool
    cellPool = new cc.NodePool();

    cellTable: CellCtrl[][] = [];

    get cellIdTable() {
        return this.cellTable.map((item) => item.map((item) => item.id));
    }

    cellIcons: cc.SpriteFrame[] = [];

    // 待交换的棋子
    swapCells: CellCtrl[] = [];

    // 当前处于活动状态的棋子数
    private activeCellCount = 0;

    // 移动状态
    moveState: MoveState = 0;

    // 当前状态
    state: CellState = 0;

    get active() {
        return this.activeCellCount > 0;
    }

    get disabled() {
        return this.gameCtrl.disabled || this.active;
    }

    protected onLoad(): void {
        // init cell pool
        const initCount = ROW_COUNT * COL_COUNT;
        for (let i = 0; i < initCount; ++i) {
            const cell = cc.instantiate(this.prefabCell); 
            this.cellPool.put(cell); 
        }
        this.init();
    }

    createCell() {
        let cell: cc.Node = null;
        if (this.cellPool.size() > 0) {
            cell = this.cellPool.get();
        } else {
            cell = cc.instantiate(this.prefabCell); 
        }
        return cell;
    }

    destroyCell(cell: cc.Node) {
        this.cellPool.put(cell);
    }

    init() {
        for (let i = 0; i < COL_COUNT; ++i) {
            this.cellTable[i] = []
            for (let j = 0; j < ROW_COUNT; ++j) {
                const cell = this.createCell();
                const cellCtrl: CellCtrl = cell.getComponent('cell');
                cellCtrl.boardCtrl = this;
                cellCtrl.init(j, i);
                this.cellTable[i][j] = cellCtrl;
                this.cellRoot.addChild(cell);
            }
        }
    }

    resetTable() {
        this.initTable();
        this.startFall();
    }

    initGame(cellIcons: cc.SpriteFrame[]) {
        this.cellIcons = cellIcons;
    }

    gameStart() {
        this.initTable();
        this.startFall();
    }

    startFall() {
        this.state = CellState.Fall;
        for (let i = 0; i < COL_COUNT; ++i) {
            for (let j = 0; j < ROW_COUNT; ++j) {
                const cellCtrl = this.cellTable[i][j]
                cellCtrl.startFall(cellCtrl.y + this.cellRoot.height);
            }
        }
    }

    initTable() {
        // console.log('init table');
        for (let i = 0; i < COL_COUNT; ++i) {
            for (let j = 0; j < ROW_COUNT; ++j) {
                const id = this.getRandomId();
                this.cellTable[i][j].setId(id);
            }
        }
        if (this.checkInitTableOver()) {
            return;
        }
        this.initTable();
    }

    /**
     * 检查棋盘上是否不存在直接可消除的棋子，且存在交换之后可消除的棋子
     * @returns 
     */
    checkInitTableOver() {
        return !this.checkCanClear() && this.checkCanSwapAndClear();
    }

    /**
     * 检查棋盘上是否存在直接可消除的棋子
     * @returns 
     */
    checkCanClear() {
        const cellIdTable = this.cellIdTable;
        for (let i = 0; i < COL_COUNT; ++i) {
            for (let j = 0; j < ROW_COUNT; ++j) {
                const cell = this.cellTable[i][j];
                const { horizontal, vertical } = tryClear(cell, cellIdTable);
                if (horizontal.size >= CLEAR_NUM || vertical.size >= CLEAR_NUM) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 检查棋盘上是否存在交换之后可消除的棋子
     * @returns 
     */
    checkCanSwapAndClear() {
        const cellIdTable = this.cellIdTable;
        for (let i = 0; i < COL_COUNT; ++i) {
            for (let j = 0; j < ROW_COUNT; ++j) {
                const cell = this.cellTable[i][j];
                const result = trySwapAndClear(cell, cellIdTable);
                if (result) {
                    return true;
                }
            }
        }
        return false;
    }

    startOneAction() {
        this.activeCellCount++;
    }

    stopOneAction() {
        this.activeCellCount--;
        if (this.activeCellCount !== 0) {
            return;
        }
        if (this.state === CellState.Fall) {
            // 收集所有可消除的棋子，直接进行消除
            // 若不存在任何可直接或交换后消除的棋子，则重置游戏
            const clearColMap = new Map<number, number[]>();
            const cellIdTable = this.cellIdTable;
            this.cellTable.forEach((item) => item.forEach((cell) => {
                buildClearColMap(cell, cellIdTable, clearColMap);
            }));
            if (clearColMap.size) {
                this.clear(clearColMap);
            } else if(!this.checkCanSwapAndClear()){
                this.resetTable();
            }
            this.gameCtrl.checkOver();
            return;
        }
        if (this.state === CellState.Swap && this.swapCells.length === 2 && this.moveState !== MoveState.None) {
            const cell1 = this.swapCells[0];
            const cell2 = this.swapCells[1];
            // 判断交换完棋子后是否可消除，否则换回来
            // 按列进行消除
            const cellIdTable = this.cellIdTable;
            const clearColMap = new Map<number, number[]>();
            buildClearColMap(cell1, cellIdTable, clearColMap);
            buildClearColMap(cell2, cellIdTable, clearColMap);
            if (clearColMap.size) {
                this.clear(clearColMap);
            } else {
                this.swap(cell1, cell2);   
            }  
            this.swapCells.length = 0;
            this.moveState = MoveState.None;
            return;
        }
        this.state = CellState.Normal;
        this.gameCtrl.checkOver();
    }

    /**
     * 获取cell icon id
     * @returns 
     */
    getRandomId() {
        return Math.floor(Math.random() * this.cellIcons.length);
    }

    onCellClick(cell: CellCtrl) {
        this.trySwap(cell);
    }

    trySwap(cell: CellCtrl) {
        const size = this.swapCells.length;
        if (size === 0) {
            cell.setSelected(true);
            this.swapCells.push(cell);
        } else if (size === 1) {
            const otherCell = this.swapCells[0];
            if (otherCell === cell) {
                return;
            }
            otherCell.setSelected(false);
            this.moveState = checkAdjacent(cell, otherCell);
            if (this.moveState !== MoveState.None) {
                this.swapCells.push(cell);
                this.swap(cell, otherCell);
                this.gameCtrl.moveOneStep();
            } else {
                this.swapCells.pop();
                cell.setSelected(true);
                this.swapCells.push(cell);
            }
        }
    }

    swap(cell1: CellCtrl, cell2: CellCtrl) {
        // console.log('swap');
        this.state = CellState.Swap;
        cell1.startSwap(cell2.id, cc.v2(cell2.x, cell2.y), this.moveState);
        cell2.startSwap(cell1.id, cc.v2(cell1.x, cell1.y), this.moveState);
    }

    /**
     * 按列从下到上依次进行消除
     * @param clearColMap 
     */
    clear(clearColMap: Map<number, number[]>) {
        // console.log('clear');
        this.state = CellState.Fall;
        for (let [col, cells] of clearColMap) {
            const endIndex = cells.at(-1);
            const { row: endRow } = getRowAndCol(endIndex);
            const len = cells.length;
            for (let i = endRow; i >= 0; --i) {
                // 获取上方的棋子id，如果超出范围，则重新生成一个棋子id
                // 上方的所有棋子需要依次向上变化
                const upRow = i - len;
                const upId = upRow >= 0 ? this.cellTable[col][upRow].id : this.getRandomId(); 
                const cell = this.cellTable[col][i];
                cell.startFall(cell.y + cell.node.height * len);
                cell.setId(upId);
            }
        }
    }
  
}