import MainCtrl from "./main";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResourceCtrl extends cc.Component {

    mainCtrl: MainCtrl = null;

    @property([cc.SpriteFrame])
    gameBgs: cc.SpriteFrame[] = [];

    /** cell icon */
    @property([cc.SpriteFrame])
    cellIcons: cc.SpriteFrame[] = [];

}