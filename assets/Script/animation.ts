import MainCtrl from "./main";
import { AnimationType } from './types';

const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimationCtrl extends cc.Component {

    mainCtrl: MainCtrl = null;

    // 得分动画
    @property(cc.Node)
    score: cc.Node = null;

    // 是否处于播放状态
    playing = false;

    animationMap = new Map<AnimationType, Function>();

    protected onLoad(): void {
        this.score.active = false;
        this.animationMap.set(AnimationType.Score, this.playScore.bind(this));
    }

    public play(type: AnimationType, ...args: any[]) {
        if (this.playing) {
            return;
        }
        if (this.animationMap.has(type)) {
            this.playing = true;
            this.animationMap.get(type)(args);
        }
    }

    private playScore() {
        this.score.x = 700;
        this.score.y = -650;
        this.score.scale = 0.1;
        this.score.active = true;
        const tween = cc.tween;
        tween(this.score)
            .to(0.5, { position: cc.v3(0, 0), scale: 1 })
            .sequence(
                tween().by(0.1, { y: 50 }, { easing: 'quadOut' }),
                tween().by(0.1, { y: -50 }, { easing: 'quadIn' })
            )
            .repeat(4)    
            .delay(0.5)
            .call(() => {
                this.score.active = false;
                this.playing = false;
            })
            .start();

    }
}