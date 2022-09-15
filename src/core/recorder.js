// 获取默认配置
import {defaultRecorderOptions} from "../config/config.default.js";
// 绘制方法
import {
    distance,
    drawLine,
    drawHollowCircle,
    drawSolidCircle,
    getCanvasPoint
} from "../utils/draw-utils.js";

export default class Recorder{
    static get ERR_USER_CANCELED(){
        return '用户已经取消';
    }
    static get ERR_NO_TASK(){
        return '暂无任务可执行';
    }
    constructor(options) {
        this.options = Object.assign({}, defaultRecorderOptions, options);
        this.container = null; // 容器
        this.circleCanvas = null; // 画圆的 canvas
        this.lineCanvas = null; // 画固定线条 canvas
        this.moveCanvas = null; // 画不固定线条的 canvas
        this.circles = []; // dotNum x dotNum 个实心圆坐标相关数据
        this.recordingTask = null; // 记录任务
        // 是否自动渲染
        if(this.options.autoRender) {
            this.render();
        }
    }
    // 渲染方法
    render() {
        // 拿到容器
        this.container = this.options.container || document.createElement('div');
        // 拿到容器宽高
        let {width, height} = container.getBoundingClientRect();
        // 画圆的 canvas
        this.circleCanvas = document.createElement("canvas");
        // 设置 circleCanvas 的宽高一样
        this.circleCanvas.width = this.circleCanvas.height = 2 * Math.min(width, height);
        // 设置 circleCanvas 的样式支持 retina 屏
        Object.assign(this.circleCanvas.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.5)', 
        });
        /**
         * cloneNode(true)：方法可创建指定的节点的精确拷贝、拷贝所有属性和值。
         * true：递归复制当前节点的所有子孙节点
         * 复制画圆的 canvas 属性给到 lineCanvas、moveCanvas
         * */ 
        this.lineCanvas = this.circleCanvas.cloneNode(true);
        this.moveCanvas = this.circleCanvas.cloneNode(true);
        // 将三个 canvas 添加到容器里
        container.appendChild(this.lineCanvas);
        container.appendChild(this.moveCanvas);
        container.appendChild(this.circleCanvas);

        // touchmove 事件在 Chrome 下默认是一个 Passive Event 需要传参 {passive: false}，否则就不能 preventDefault。
        this.container.addEventListener('touchmove', evt => evt.preventDefault(), { passive: false });

        // 开始渲染时清除上一次记录
        this.clearPath();
    }
    // 负责在画布上清除上一次记录的结果
    clearPath() {
        // 如果没有画圆的 canvas，则重新渲染
        if(!this.circleCanvas){
            this.render()
        };
        // 获取三个 canvas 的上下文，宽度，还有配置项
        let {circleCanvas, lineCanvas, moveCanvas, options} = this,
            circleCtx = circleCanvas.getContext('2d'),
            lineCtx = lineCanvas.getContext('2d'),
            moveCtx = moveCanvas.getContext('2d'),
            width = circleCanvas.width,
            {dotNum, defaultCircleColor, innerRadius} = options;

        // 清除三个 canvas 画布
        circleCtx.clearRect(0, 0, width, width);
        lineCtx.clearRect(0, 0, width, width);
        moveCtx.clearRect(0, 0, width, width);

        // 绘制 dotNum x dotNum 个实心圆
        let range = Math.round(width / (dotNum + 1));
        let circles = [];
        for(let i = 1; i <= dotNum; i++){
            for(let j = 1; j <= dotNum; j++){
                let y = range * i, x = range * j;
                drawSolidCircle(circleCtx, defaultCircleColor, x, y, innerRadius);
                let circlePoint = {x, y};
                circlePoint.pos = [i, j];
                circles.push(circlePoint);
            }
        }
        this.circles = circles;
    }
    // 负责记录：它是一个异步的，因为不知道什么时候用户停止移动，这里我们返回一个 promise 对象回去，让用户决定停止移动的
    async record() {
        // 获取三个 canvas 的上下文，还有配置项
        let {circleCanvas, lineCanvas, moveCanvas, options} = this,
            circleCtx = circleCanvas.getContext('2d'),
            lineCtx = lineCanvas.getContext('2d'),
            moveCtx = moveCanvas.getContext('2d');

        // 记录激活的圆点
        let records = [];
        // touchstart、touchmove事件执行的方法，用于绘制激活状态
        let handler = evt => {
            // 每次touchstart时清除上一次记录的结果
            if(evt.type === "touchstart") {
                records = [];
                this.clearPath();
            }
            // 获取配置
            let {bgColor, focusColor, innerRadius, outerRadius, touchRadius} = options;
            // 通过 changedTouches 转换得倒移动点的坐标
            let {clientX, clientY} = evt.changedTouches[0],
                touchPoint = getCanvasPoint(moveCanvas, clientX, clientY);
            // 遍历之前存的圆点
            for(let i = 0; i < this.circles.length; i++){
                // 取出之前圆点的坐标
                let point = this.circles[i],
                    x0 = point.x,
                    y0 = point.y;

                // 判断圆点跟移动点的距离是否小于判定touch事件的圆半径
                if(distance(point, touchPoint) < touchRadius){
                    // 绘制白色的圆，半径为 outerRadius
                    drawSolidCircle(circleCtx, bgColor, x0, y0, outerRadius);
                    // 绘制激活色的圆，半径为 innerRadius
                    drawSolidCircle(circleCtx, focusColor, x0, y0, innerRadius);
                    // 绘制激活的空心圆，半径为 outerRadius
                    drawHollowCircle(circleCtx, focusColor, x0, y0, outerRadius);

                    // 如果 records 里面有圆点了，就跟最后一个连线
                    if(records.length){
                        let p2 = records[records.length - 1],
                            x1 = p2.x,
                            y1 = p2.y;

                        drawLine(lineCtx, focusColor, x0, y0, x1, y1);
                    }
                    // 将 circles 里圆点截取出来，push 到 records 里面
                    let circle = this.circles.splice(i, 1);
                    records.push(circle[0]);
                    // 找到之后就break
                    break;
                }
            }
            // 如果 records 里面有圆点了，就跟最后一个连线
            if(records.length){
                let point = records[records.length - 1],
                    x0 = point.x,
                    y0 = point.y,
                    x1 = touchPoint.x,
                    y1 = touchPoint.y;
                // 先清空画布
                moveCtx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);
                // 画移动的线
                drawLine(moveCtx, focusColor, x0, y0, x1, y1);        
            }
        };

        // 监听touchstart、touchmove事件
        circleCanvas.addEventListener('touchstart', handler);
        circleCanvas.addEventListener('touchmove', handler);

        let recordingTask = {};
        let promise = new Promise((resolve, reject) => {
            // 给recordingTask添加取消的方法
            recordingTask.cancel = (res = {}) => {
                let promise = this.recordingTask.promise;

                res.err = res.err || Recorder.ERR_USER_CANCELED;
                circleCanvas.removeEventListener('touchstart', handler);
                circleCanvas.removeEventListener('touchmove', handler);
                document.removeEventListener('touchend', done);
                resolve(res);
                this.recordingTask = null;

                return promise;
            }
            let done = evt => {
                // 清空移动canvas的画布
                moveCtx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);
                // 如果没有记录的点直接退出
                if(!records.length) return;
                // 移除事件
                circleCanvas.removeEventListener('touchstart', handler);
                circleCanvas.removeEventListener('touchmove', handler);
                document.removeEventListener('touchend', done);

                let err = null;

                // 如果记录的个数小于配置的最小允许的点数，就提示报错
                if(records.length < options.minPoints){
                    err = `连接点数至少需要${options.minPoints}个`;
                }

                // 把坐标转成字符串
                resolve({
                    err, 
                    records: records.map(o => o.pos.join('')).join('')
                });
                this.recordingTask = null;
            };
            // 监听 touchend 事件
            document.addEventListener('touchend', done);
        });

        recordingTask.promise = promise;

        this.recordingTask = recordingTask;
        return promise;
    }
    // 负责终止记录过程，同样也是返回一个promise
    async cancel() {
        // 如果有任务就执行任务里的 cancel 方法
        if(this.recordingTask){
            return this.recordingTask.cancel();
        }
        return Promise.resolve({err: Recorder.ERR_NO_TASK});
    }
}