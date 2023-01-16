import MainCtrl from "../../main";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinCtrl extends cc.Component {

    mainCtrl: MainCtrl = null;

    get disabeld() {
        return this.mainCtrl.disabled;
    }

    protected onLoad(): void {

    }

    backHome(): void {
        if (this.disabeld) {
            return;
        }
        this.mainCtrl.backHome(this.node);
    }

    gameNext(): void {
        if (this.disabeld) {
            return;
        }
        this.mainCtrl.gameNext();
    }
}