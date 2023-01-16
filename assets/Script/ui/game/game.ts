import MainCtrl from "../../main";
import BoardCtrl from "./board";
import { STEP_NUM, SCORE_NUM } from "../../utils/config";
import { AnimationType } from "../../types";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCtrl extends cc.Component {

    mainCtrl: MainCtrl = null;

    @property(BoardCtrl)
    boardCtrl: BoardCtrl = null;

    @property(cc.Sprite)
    gameBg: cc.Sprite = null;

    @property(cc.Prefab)
    scorePrefab: cc.Prefab = null;

    @property(cc.Node)
    scoreRoot: cc.Node = null;

    @property(cc.Node)
    animationRoot: cc.Node = null;

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

    @property(cc.Node)
    scoreProgressBar: cc.Node = null;

    totalScoreProgress = 103;

    targetScore = SCORE_NUM;

    private _currentScore = 0;

    set currentScore(score: number) {
        this._currentScore = score;
        this.scoreProgressBar.height = score / this.targetScore * this.totalScoreProgress;
    }

    get currentScore() {
        return this._currentScore;
    }

    actionCount = 0;

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
        this.currentScore = 0;
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

    gameWin() {
        if (this.disabled) {
            return;
        }
        this.mainCtrl.gameWin();
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

    startOneAction() {
        this.actionCount++;
    }

    stopOneAction() { 
        this.actionCount--;
    }

    checkOver() {
        if (this.currentScore >= this.targetScore) {
              // win
            if (this.actionCount <= 0) {
                this.gameWin();
            }
            return;
        }
        if (this.stepNum <= 0) {
            // lose
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

    /** score */

    addScore() {
        if (this.currentScore >= this.targetScore) {
            this.checkOver();
            return;
        }
        let score = this.currentScore + 1;
        if (score >= this.targetScore) {
            score = this.targetScore;
        }
        this.currentScore = score;
        this.checkOver();
    }

    creatScore(worldPos: cc.Vec2, delay: number) {
        this.startOneAction();
        const scoreNode = cc.instantiate(this.scorePrefab);
        scoreNode.parent = this.animationRoot;
        const locationPos = this.animationRoot.convertToNodeSpaceAR(worldPos);
        scoreNode.setPosition(locationPos);
        const targetPos = this.scoreRoot.position;
        const pos1 = cc.v2(scoreNode.x + (targetPos.x - scoreNode.x) * 1, scoreNode.y);
        const pos2 = cc.v2(targetPos.x, targetPos.y - (targetPos.y - scoreNode.y) * 0.4);
        const pos3 = cc.v2(targetPos.x, targetPos.y);
        // const bezier = [pos1, pos2, pos3];
        // scoreNode.runAction(
        //     cc.sequence(
        //         cc.delayTime(delay),
        //         cc.bezierTo(0.8, bezier),
        //         cc.callFunc(() => {
        //             this.stopOneAction();
        //             scoreNode.destroy();
        //             this.addScore();
        //         })
        //     )
        // );
        cc.tween(scoreNode)
            .delay(delay)
            .bezierTo(0.8, pos1, pos2, pos3)
            .call(() => {
                this.stopOneAction();
                scoreNode.destroy();
                this.addScore();
            })
            .start();
    }
}