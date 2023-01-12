import MainCtrl from "../../main";
import BoardCtrl from "./board";
import { STEP_NUM } from "../../utils/config";
import { AnimationType } from "../../types";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCtrl extends cc.Component {

    mainCtrl: MainCtrl = null;

    @property(BoardCtrl)
    boardCtrl: BoardCtrl = null;

    @property(cc.Sprite)
    gameBg: cc.Sprite = null;

    private _gameBgId = 0;

    set gameBgId(id: number) {
        this._gameBgId = id;
        const spriteFrame = this.mainCtrl.resourceCtrl.gameBgs[id];
        const texture = spriteFrame.getTexture();
        this.gameBg.spriteFrame = spriteFrame;
        this.gameBg.node.width = texture.width;
        this.gameBg.node.height = texture.height;
    }

    get gameBgId() {
        return this._gameBgId;
    }

    @property(cc.Label)
    stepLabel: cc.Label = null;

    private _stepNum = STEP_NUM;

    set stepNum(num: number) {
        this._stepNum = num;
        this.stepLabel.string = `step: ${num}`;
    }

    get stepNum() {
        return this._stepNum;
    }

    board = [];

    get disabled() {
        return this.mainCtrl.disabled;
    }

    protected onLoad(): void {
        // bind game ctrl
        this.boardCtrl.gameCtrl = this;
    }

    initGame() {
        this.stepNum = STEP_NUM;
        // this.initGameBg();
        this.boardCtrl.initGame(this.getIcons());
    }

    gameStart() {
        this.boardCtrl.gameStart();
    }

    gameEnd() {
        if (this.disabled) {
            return;
        }
        this.mainCtrl.gameEnd();
    }

    /**
     * 从所有cell icon图集中随机取6个
     */
    getIcons() {
        // const icons = this.mainCtrl.resourceCtrl.cellIcons;
        // const index = Math.floor(Math.random() * 35);
        // return icons.slice(index, index + 6);
        const allIcons = [...this.mainCtrl.resourceCtrl.cellIcons];
        const icons: cc.SpriteFrame[] = [];
        while (icons.length < 6) {
            const index = Math.floor(Math.random() * allIcons.length);
            icons.push(allIcons.splice(index, 1)[0]);
        }
        return icons;
    }

    initGameBg() {
        this.gameBgId = Math.floor(Math.random() * this.mainCtrl.resourceCtrl.gameBgs.length);
    }

    updateGameBg() {
        this.gameBgId = (this.gameBgId + 1) % this.mainCtrl.resourceCtrl.gameBgs.length;
    }

    addStep(num: number) {
        this.stepNum += num;
    }

    moveOneStep() {
        const num = this.stepNum - 1;
        this.stepNum = num > 0 ? num : 0;
    }

    checkOver() {
        if (this.stepNum <= 0) {
            this.gameEnd();
        }
    }

    /**
     * 道具1: 更新背景
     */
    useTool1() {
        this.updateGameBg();
    }

    /**
     * 道具2: 增加步数
     */
    useTool2() {
        this.addStep(1);
    }

    /**
     * 道具3: 提示
     */
    useTool3() {
        this.mainCtrl.animationCtrl.play(AnimationType.Score);
    }

    /**
     * 道具4: 重置棋盘
     */
    useTool4() {
        if (!this.boardCtrl.disabled) {
            this.boardCtrl.resetTable();
        }
    }
}