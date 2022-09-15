# h5-handlelock
使用 rollup 打包一个原生 js + canvas 实现的移动端手势解锁功能组件

## 配置项

```js
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
```

## 添加 recorder.html 示例

添加文件 `example/recorder.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>kaimo handlock recorder demo</title>
    <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.9/theme-chalk/index.css">
    <style>
        * { 
            padding: 0;
            margin: 0; 
        }
        html, body { 
            width: 100%; 
            height: 100%;
            overflow: hidden;
        }
        #container {
            position: relative;
            overflow: hidden;
            width: 100%;
            padding-top: 100%;
            height: 0px;
            background-color: white;
        }
        .control {
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <div class="control">
        <button id="cancelBtn" class="el-button el-button--mini el-button--danger">取消</button>
    </div>
    <script src="https://github.com/kaimo313/h5-handlelock/blob/main/lib/kaimo-handlock-umd.js"></script>
    <script>
        // KaimoHandlock是打包暴露出来的，创建一个Recorder实例
        var recorder = new KaimoHandlock.Recorder({
            container: document.querySelector('#container'),
        });
        console.log(recorder)
        function recorded(res) {
            if(res.err){
                console.error(res.err)
                recorder.clearPath();
                if(res.err !== KaimoHandlock.Recorder.ERR_USER_CANCELED){
                    recorder.record().then(recorded);
                }
            }else{
                console.log("密码字符串：", res.records)
                recorder.record().then(recorded);
            }  
        }

        recorder.record().then(recorded);
        
        // 点击取消
        cancelBtn.onclick = function(){
            recorder.cancel();
            recorder.clearPath();
        }
    </script>
</body>
</html>
```

## 添加 locker.html 示例

添加文件 `example/locker.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>kaimo handlock locker demo</title>
    <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.9/theme-chalk/index.css">
    <style>
        * { 
            padding: 0;
            margin: 0; 
        }
        html, body { 
            width: 100%; 
            height: 100%;
            overflow: hidden;
        }
        #container {
            position: relative;
            overflow: hidden;
            width: 100%;
            padding-top: 100%;
            height: 0px;
            background-color: white;
        }
        .control {
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <div class="control">
        <button id="setPasswordBtn" class="el-button el-button--mini">设置密码</button>
        <button id="checkPasswordBtn" class="el-button el-button--mini">验证密码</button>
    </div>
    <script src="https://github.com/kaimo313/h5-handlelock/blob/main/lib/kaimo-handlock-umd.js"></script>
    <script>
        var password = localStorage.getItem('kaimo_handlock_passwd') || '1221322322';
        // KaimoHandlock是打包暴露出来的，创建一个Locker实例
        var locker = new KaimoHandlock.Locker({
            container: document.querySelector('#container'),
            check: {
                checked: function(res){
                    locker.clearPath();
                    console.log("checked--->", res)
                    if(res.err){
                        if(res.err === KaimoHandlock.Locker.ERR_PASSWORD_MISMATCH){
                            console.error("密码错误，请重新绘制！")
                        }else{
                            console.error(res.err)
                        }
                    }else{
                        console.log("密码正确！")
                    }
                },
            },
            update:{
                beforeRepeat: function(res){
                    locker.clearPath();
                    if(res.err){
                        console.log(`请连接至少${locker.options.minPoints}个点`)
                    }else{
                        console.log("请再次绘制相同图案")
                    }
                },
                afterRepeat: function(res){
                    locker.clearPath();
                    if(res.err){
                        if(res.err === KaimoHandlock.Locker.ERR_PASSWORD_MISMATCH){
                            console.log("两次绘制的图形不一致，请重新绘制！")
                        }else{
                            console.log(`请连接至少${locker.options.minPoints}个点`)
                        }
                    }else{
                        password = res.records;
                        localStorage.setItem('kaimo_handlock_passwd', password);
                        console.log("密码更新成功：", password)
                    }
                },
            }
        });
        console.log(locker)
        
        // 点击设置密码
        setPasswordBtn.onclick = function(){
            setPasswordBtn.classList.add("el-button--success");
            checkPasswordBtn.classList.remove("el-button--success");
            locker.clearPath();
            locker.update();
        }
        // 点击验证密码
        checkPasswordBtn.onclick = function(){
            checkPasswordBtn.classList.add("el-button--success");
            setPasswordBtn.classList.remove("el-button--success");
            locker.clearPath();
            locker.check(password);
        }
    </script>
</body>
</html>
```

## 启动服务测试

- 第一个服务是 rollup 的
- 第二个服务是 liveserve 的用于访问 html 页面

`recorder.html` 测试结果，需要切换到移动端模式，刷新之后就可以测试了。主要就是绘制完看效果，

![在这里插入图片描述](https://img-blog.csdnimg.cn/48104c0b133946309dbc078acbae7990.png)
`locker.html` 测试结果，相对上面一个，测试复杂一点，点击下面两个按钮是用于切换当前的模式的，切到设置模式会有两次的输入，如果两次都输入正确，就会把密码保存到localStorage，验证密码就是通过设置的密码去校验输入的密码是否一样。感兴趣的可以自己测试玩玩。

![在这里插入图片描述](https://img-blog.csdnimg.cn/60260b327d134981bf9cd49f06c91d15.png)

localStorage 里的缓存如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/9acf9f2bffca4e8eb52581ab2f2ef9b2.png)