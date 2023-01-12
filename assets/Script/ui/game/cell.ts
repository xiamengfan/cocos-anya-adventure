import { CellState, MoveState } from "./gameTypes";
import BoardCtrl from "./board";
import { COL_COUNT } from '../../utils/config'


const { ccclass, property } = cc._decorator;

@ccclass
export default class CellCtrl extends cc.Component {

    boardCtrl: BoardCtrl = null;

    // 所在行
    row = 0;

    // 所在列
    col = 0;

    // 图标
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    // 选中框
    @property(cc.Node)
    private nodeSelected: cc.Node = null;

    // 是否选中
    selected = false;

    // 当前状态
    state: CellState = 0;

    // 对应icon的id
    id = 0;

    // 位置索引
    get index() {
        return this.row * COL_COUNT + this.col;
    }

    // 所在x坐标
    x = 0;

    // 所在y坐标
    y = 0;

    // 降落速度
    fallSpeed = 30;

    // 降落起点y坐标
    fallStartY = 0;

    // 交换移动速度
    swapSpeed = 10;

    // 交换后的id
    swapId = 0;

    // 交换移动后的位置
    swapEndPos: cc.Vec2 = null;

    // 移动状态
    moveState: MoveState = 0;

    // 移动方向
    moveDirection: boolean = true;

    get disabled() {
        return this.boardCtrl.disabled;
    }

    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onClick, this);
    }

    init(row: number, col: number) {
        this.setState(CellState.None);
        this.setSelected(false);
        this.row = row;
        this.col = col;
        this.x = this.col * this.node.width + this.node.width / 2;
        this.y = -(this.row * this.node.height + this.node.height / 2);
        this.node.x = this.x;
        this.node.y = this.y;
    }

    setId(id: number) {
        this.id = id;
        const icon = this.boardCtrl.cellIcons[id];
        this.icon.spriteFrame = icon;
    }

    setState(state: CellState) {
        this.state = state;
        if (state === CellState.None) {
            this.node.active = false;
            return;
        }
        this.node.active = true;
    }

    setSelected(selected: boolean) {
        this.selected = selected;
        this.nodeSelected.active = selected;
    }

    onClick() {
        this.boardCtrl.onCellClick(this);
    }

    startFall(fallStartY: number) {
        this.node.y = fallStartY;
        this.boardCtrl.startOneAction();
        this.setState(CellState.Fall);
    }

    startSwap(swapId, swapEndPos: cc.Vec2, moveState: MoveState) {
        this.swapId = swapId;
        this.swapEndPos = swapEndPos;
        this.moveState = moveState;
        if (moveState === MoveState.Horizontal) {
            this.moveDirection = this.node.x < this.swapEndPos.x ? true : false;
        } else if (moveState === MoveState.Vertical) {
            this.moveDirection = this.node.y < this.swapEndPos.y ? true : false;
        }
        this.boardCtrl.startOneAction();
        this.setState(CellState.Swap);
    }

    protected update(dt: number): void {
        if (this.state === CellState.Fall) {
            const tempY = this.node.y - this.fallSpeed;
            if (tempY <= this.y) {
                this.node.y = this.y;
                this.setState(CellState.Normal);
                this.boardCtrl.stopOneAction();
            } else {
                this.node.y = tempY;
            }
            return;
        }
        if (this.state === CellState.Swap) {
            const { x, y } = this.node;
            const { x: x2, y: y2 } = this.swapEndPos;
            let completed = false;
            if (this.moveState === MoveState.Horizontal) {
                if (this.moveDirection) {
                    const tempX = x + this.swapSpeed;
                    if (tempX >= x2) {
                        this.node.x = x2;
                        completed = true;
                    } else {
                        this.node.x = tempX;
                    }
                } else {
                    const tempX = x - this.swapSpeed;
                    if (tempX <= x2) {
                        this.node.x = x2;
                        completed = true;
                    } else {
                        this.node.x = tempX;
                    }
                }
            } else if (this.moveState === MoveState.Vertical) {
                if (this.moveDirection) {
                    const tempY = y + this.swapSpeed;
                    if (tempY >= y2) {
                        this.node.y = y2;
                        completed = true;
                    } else {
                        this.node.y = tempY;
                    }
                } else {
                    const tempY = y - this.swapSpeed;
                    if (tempY <= y2) {
                        this.node.y = y2;
                        completed = true;
                    } else {
                        this.node.y = tempY;
                    }
                }
            }
            if (completed) {
                this.node.x = this.x;
                this.node.y = this.y;
                this.setId(this.swapId);
                this.setState(CellState.Normal);
                this.boardCtrl.stopOneAction();
            }
            return;
        }
    }
}