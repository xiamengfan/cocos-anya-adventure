import { UITransitionConfig, UITransitionState } from './types';
import StartCtrl from './ui/start/start';
import GameCtrl from './ui/game/game';
import EndCtrl from './ui/end/end';
import ResourceCtrl from './resource';
import AnimationCtrl from './animation';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainCtrl extends cc.Component {

    @property(StartCtrl)
    startCtrl: StartCtrl = null;

    @property(GameCtrl)
    gameCtrl: GameCtrl = null;

    @property(EndCtrl)
    endCtrl: EndCtrl = null;

    @property(ResourceCtrl)
    resourceCtrl: ResourceCtrl = null;

    @property(AnimationCtrl)
    animationCtrl: AnimationCtrl = null;

    @property(cc.Node)
    uiStart: cc.Node = null;

    @property(cc.Node)
    uiGame: cc.Node = null;

    @property(cc.Node)
    uiEnd: cc.Node = null;

    disabled = false;

    protected onLoad(): void {
        // bind main ctrl
        this.startCtrl.mainCtrl = this;
        this.gameCtrl.mainCtrl = this;
        this.endCtrl.mainCtrl = this;

        // init ui
        this.uiStart.active = true;
        this.uiGame.active = false;
        this.uiEnd.active = false;
    }

    gameStart(): void {
        this.gameCtrl.initGame();
        this.uiGame.active = true;
        this.switchUI(this.uiStart, { state: UITransitionState.Upward }, () => {
            this.uiStart.active = false;
            this.gameCtrl.gameStart();
        });
    }

    gameEnd(): void {
        this.switchUI(this.uiEnd, { state: UITransitionState.Downwrad }, () => {
            this.uiGame.active = false;
        });
    }

    gameRetry() {
        this.gameCtrl.initGame();
        this.uiGame.active = true;
        this.switchUI(this.uiEnd, { state: UITransitionState.Upward }, () => {
            this.uiEnd.active = false;
            this.gameCtrl.gameStart();
        });
    }

    backHome(currentUI: cc.Node): void {
        this.switchUI(this.uiStart, { state: UITransitionState.Downwrad }, () => {
            currentUI.active = false;
        });
    }

    private switchUI(ui: cc.Node, config: UITransitionConfig, cb?: () => void): void {
        this.disabled = true;
        const { time = 1, state } = config;
        switch (state) {
            case UITransitionState.Upward:
                ui.active = true;
                cc.tween(ui)
                    .to(0, { position: cc.v3(0, 0) })
                    .to(time, { position: cc.v3(0, ui.height) }, { easing: 'backIn' })
                    .call(() => {
                        this.disabled = false;
                        cb && cb();
                    })
                    .start();
                break;
            case UITransitionState.Downwrad:
                cc.tween(ui)
                    .to(0, { position: cc.v3(0, ui.height) })
                    .call(() => { ui.active = true; })
                    .to(time, { position: cc.v3(0, 0) }, { easing: 'bounceOut' })
                    .call(() => {
                        this.disabled = false;
                        cb && cb();
                    })
                    .start();
        }
    }
}
