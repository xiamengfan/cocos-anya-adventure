import MainCtrl from "../../main";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StartCtrl extends cc.Component {

    mainCtrl: MainCtrl;

    get disabeld() {
        return this.mainCtrl.disabled;
    }

    protected onLoad(): void {

    }

    gameStart(): void {
        if (this.disabeld) {
            return;
        }
        this.mainCtrl.gameStart();
    }
}