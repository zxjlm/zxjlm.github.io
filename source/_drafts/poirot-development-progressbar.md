---
title: Poirot开发记录(1) -- 进度条
date: 2020-12-17 15:55:00
updated: 2020-12-17 15:55:00
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - dailyTools
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

Poirot 是自动将字体文件(woff\woff2\ttf)映射为结果字典,主要用于中文字体反爬虫的破解,包括 css 字体映射和图片文字反爬虫.

实现的基础思路可见于[字体反爬虫解决方案-自动化通过字体文件生成映射字典](https://blog.harumonia.moe/font-antispider-cracker/).

与 [Mori](https://blog.harumonia.moe/mori-kokoro/) 同属于爬虫工作的小工具.名字取自大侦探波洛(_Hercule Poirot_). 与 Mori 的脚本服务不同,这次从实际使用的角度考虑,采用了 web 服务的形式.

本篇记录了 Poirot 的开发中学习到的技术和踩到的坑。

主要包括:

1. flask-websocket 的使用
2. 进度条的实现

<!-- more -->

## 进度条的实现

制作前端进度条的目的无非是以下几种.

1. 美观的\功能全面的 UI
2. 防止给用户造成无相应的错觉

第二点在进行数据分析的项目时比较常见,动辄数分钟的后端处理,对于不明就里的用户来说很容易去乱点一些东西,以致不必要的麻烦.

使用目的的不同也就导致了实现方案的不同.我开发主要使用过 3 种实现方案.

1. 假进度条
2. 前端轮询
3. WebScoket

接下来我将详细解释三者的具体实现.

### 假进度条

顾名思义，这就是一个脱离了后端的，无法真正反映处理进度的"进度条",简言之，空壳子. 使用这类进度条的原因有很多:技术力不足,时间不够,服务器性能等.

前端实现一个进度条非常简单,以我最常用的 Bootstrap 为例.

```html
<div class="progress">
  <div
    class="progress-bar w-75"
    role="progressbar"
    aria-valuenow="75"
    aria-valuemin="0"
    aria-valuemax="100"
  ></div>
</div>
```

通过改变这个 tag 的宽度属性就可以实现进度条效果.具体的就是在 js 中使用 for 循环来控制(代码如下),如此就能完成一个 10 秒的进度条.

```javascript
var bar = $(".progress-bar");
for (var i = 0; i < 10; i++) {
  bar.style["width"] = i * 10 + "%";
  sleep(1000);
}
```

但是这里有一个 **根本的原则(先决条件)** ，那就是后端处理的时间必须可估算,传统的数据处理时间与回传数据的数据量是可以满足函数关系的(在保证后端稳定运行,负载可靠的情况下).

微小的偏差是允许的,但是如果出现前后端进度极大偏差,那就失了进度条使用的初衷.

这里的一个强化方案就是, _预估时间永远比处理时间要长_ ,当后端处理完成返回数据时，直接将进度条拉满,这样就实现了前后端同步的假象.

### 前端轮询

在前端请求数据分析接口 A 的同时,开启一个子线程用来统计分析的进度. 同时开启一个轮询接口 B 专门用来返回这个分析进度. 前端每隔一段时间向接口 B 查询进度，并反馈到进度条.

前端轮询的一个可参考案例就是 Miguel GrinBerg的 [flask-celery-example](https://github.com/miguelgrinberg/flask-celery-example) , 这里轮询了celery的task，让用户能够知道后台程序的处理进度。

#### 前端实现

引入了 [nanobar](https://nanobar.jacoborus.codes/) 用作进度条的展示， 以及  [toastr](https://github.com/CodeSeven/toastr) 用作关键消息闪现提示。

```javascript
async function getData(url = '') {
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin', 
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
    });
    return response.json();
}

function update_progress(nanobar, status_div, now_state = '') {
    // nanobar 是nanobar.js 提供的一个进度条插件
    // status_div 是展示进度条的div块
    
        let url = api_for_sandbox_progress.replace('none', task_id)  // 将这里的url替换成实际要请求的url
        getData(url).then(data => {
            percent = parseInt(data['info']['current'] * 100 / data['info']['total']);
            nanobar.go(percent);
            $(status_div.childNodes[1]).text(percent + '%');
            $(status_div.childNodes[2]).text(data['state']);

            if ('result' in data) {
                $(status_div.childNodes[3]).text('Result: ' + data['result']);
            } else {
                $(status_div.childNodes[3]).text('Result: ' + data['state']);
            }

            if (data['state'] === 'SUCCESS') {
                toastr["success"]('COMPLETE')   // toastr是一个消息闪现插件

                load_neo_page()
            } else if (data['state'] === 'FAILURE') {
                toastr["error"]('FAILURE')
            } else {
                if (data['state'] !== now_state) {
                    toastr["success"](data['state'])
                }
                now_state = data['state']
                $(status_div.childNodes[3]).text('Result: ' + data['state']);

                setTimeout(function () {
                    update_progress(nanobar, status_div, now_state);
                }, 2000);
            }
        })
    }
```

#### 后端实现

轮询机制下的后端代码就是将状态存储在一个队列中，当轮询请求到达时将这个队列里面的消息交付给这个请求。

### WebSocket

> WebSocket is a computer communications protocol, providing full-duplex communication channels over a single TCP connection.
> --wikipedia

在进度条上，使用 websocket 的根本目的是通过服务器端返回实时数据给前端。与前端轮询的"等间隔的时间内提高不定长的进度条长度"不同，WebScoket 拥有更加灵活的使用方式,这样做的好处就是能够让进度条的涨势更加平滑，与[假进度条](#假进度条)的平滑不同，这是在实时反映后端处理进度的基础上的。

具体的实现可见于下一段[flask-websocket 的使用](#flask-websocket-的使用)

## flask-websocket 的使用

[文档](https://flask-socketio.readthedocs.io/en/latest/)，文档中有详细的 websocket 使用案例。这里摘出我所使用的部分以为样例。

### 后端实现 👇

```python
socketio = SocketIO(app, async_mode=None)
thread = None
thread_lock = Lock()


def background_thread():
    """开始记录实时的处理进度，每隔2s返回一次"""
    while True:
        socketio.sleep(2)
        ret = []
        while not SocketQueue.res_queue.empty():
            ProgressBar.now_length += 1
            ret.append(SocketQueue.res_queue.get())
        socketio.emit('my_response',
                      {'data': ret, 'width': str(ProgressBar.calculate()) + '%'},
                      namespace='/test')


@socketio.on('connect', namespace='/test')
def test_connect():
    """建立websocket连接"""
    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_thread)

@socketio.on('disconnect_request', namespace='/test')
def disconnect_request():
    """关闭websocket连接"""
    @copy_current_request_context
    def can_disconnect():
        disconnect()

    session['receive_count'] = session.get('receive_count', 0) + 1

    emit('my_response',
         {'data': 'Disconnected!', 'count': session['receive_count']},
         callback=can_disconnect)
```

### 前端实现 👇

```js
const socket = io(namespace);

socket.on("connect", function () {
  //   socket.emit("my_event", { data: "I'm connected!" });
  toastr.success("connect success", "", { timeOut: 500 });
});

socket.on("my_response", function (msgs, cb) {
  if (msgs["data"].length > 0) {
    let progress = $("#crack-progress")[0];
    progress.style["width"] = msgs["width"];
  }

  msgs["data"].forEach(function (msg) {
    toastr.success(msg, "", { timeOut: 1000 });
  });
  if (cb) cb();
});

socket.emit("disconnect_request");
socket.close();
```

在经历了几次优化之后，**实际在代码中的应用与样例代码有所出入**。

#### 前端的坑

前端的 socket 请求需要后端的接口对应,不能出现前端有 socket 请求而后端没有对应的接口的情况,反之则没有问题.

这个坑主要是在使用 gunicorn 进行部署时出现,报错信息为 `Invalid session **** (further occurrences of this error will be logged with level INFO)` .



## 后记

至此，进度条采用了从三种实现方式中选择了 socket . 

实际上，选择socket最核心的原因就是，以前没有实际使用过这个技术，正好借着这次的机会实践一下而已。

至于性能方面，socket、前端长轮询、SSE中哪个实现方法的效率最高、消耗最低，则不在这边文章的考虑范围之内了。



