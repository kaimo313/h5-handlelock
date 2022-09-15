import Recorder from './recorder.js';
// 获取默认配置
import {defaultLockerOptions} from "../config/config.default.js";

// Locker 继承 Recorder
export default class Locker extends Recorder{
    static get ERR_PASSWORD_MISMATCH(){
        return '密码不匹配';
    }
    constructor(options = {}) {
        options.update = Object.assign({}, defaultLockerOptions.update, options.update);
        options.check = Object.assign({}, defaultLockerOptions.check, options.check);
        super(options);
    }
    // 更新密码
    async update() {
        await this.cancel();
        // 拿到钩子方法 beforeRepeat afterRepeat
        let beforeRepeat = this.options.update.beforeRepeat, 
            afterRepeat = this.options.update.afterRepeat;
        // 第一次输入密码
        let first = await this.record();
        // 如果报错并且错误等于 ERR_USER_CANCELED 就return
        if(first.err && first.err === Locker.ERR_USER_CANCELED) {
            return Promise.resolve(first);
        }
        // 如果报错，return出去
        if(first.err){
            this.update();
            beforeRepeat.call(this, first);
            return Promise.resolve(first);   
        }
        // 执行重复前的钩子
        console.log("第一次密码：", first.records);
        beforeRepeat.call(this, first);

        // 第二次输入密码
        let second = await this.record();
        // 如果报错并且错误等于 ERR_USER_CANCELED 就return
        if(second.err && second.err === Locker.ERR_USER_CANCELED) {
            return Promise.resolve(second);
        }
        // 如果第二次密码没有错，并且第一次的密码不等于第二次的就报错不匹配
        if(!second.err && first.records !== second.records){
            second.err = Locker.ERR_PASSWORD_MISMATCH;
        }

        this.update();
        // 执行重复后的钩子
        console.log("第二次密码：", second.records);
        afterRepeat.call(this, second);
        return Promise.resolve(second);   
    }
    // 校验密码
    async check(password) {
        await this.cancel();
        // 拿到 checked 方法
        let checked = this.options.check.checked;
        // 输入密码
        let res = await this.record();
        // 如果报错并且错误等于 ERR_USER_CANCELED 就return
        if(res.err && res.err === Locker.ERR_USER_CANCELED){
            return Promise.resolve(res);
        }
        // 如果没有错误，密码不一致提示密码匹配不正确
        if(!res.err && password !== res.records){
            res.err = Locker.ERR_PASSWORD_MISMATCH
        }
        // 执行 checked 回调函数，返回结果出去
        checked.call(this, res);
        console.log("输入的密码：", res.records, "需要校验的密码：", password)
        // 再次执行check，失败了可以再次输入
        this.check(password);
        return Promise.resolve(res);
    }
}