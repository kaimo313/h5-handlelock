export const defaultRecorderOptions = {
    container: null, // 创建canvas的容器，如果不填，自动在 body 上创建覆盖全屏的层
    autoRender: true, // 是否自动渲染
    dotNum: 4, // 圆点的数量： n x n
    defaultCircleColor: "#ddd", // 未选中的圆的颜色
    focusColor: '#33a06f',  //当前选中的圆的颜色
    bgColor: '#fff', // canvas背景颜色
    innerRadius: 16, // 圆点的内半径
    outerRadius: 42, // 圆点的外半径，focus 的时候显示
    touchRadius: 64, // 判定touch事件的圆半径
    minPoints: 4, // 最小允许的点数
}

export const defaultLockerOptions = {
    update: {
        beforeRepeat: function(){},
        afterRepeat: function(){}
    },
    check: {
        checked: function(){}
    }
}