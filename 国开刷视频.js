// ==UserScript==
// @name         国开自动播放下一集和解除切屏暂停视频限制
// @namespace    http://index.xn--90wo2bk78a.love/
// @version      1.1.0
// @description  国开自动播放下一集和解除切屏暂停视频限制 目前测试中
// @author       白羽
// @include      *://lms.ouchn.cn/course/*
// ==/UserScript==


/* 
    目前已完成：
        解除切屏自动暂停视频限制
        自动检测是否播放完毕，if 播放完毕就调用next_video函数 else 继续自动播放
    目前未完成：
        next_video函数还没完成，由于国开是热加载专题课程，所以还得观察具体怎么做。
*/

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function gk_pageback() { // 返回课程列表
    document.querySelector("body > div.wrapper > div.main-content.gtm-category > div:nth-child(9) > div > div.activity-area.clearfix.online-video-area > div.module-syllabus-nav.sidebar > div.return-link > a").click();
}

function onVideo() {
    let myval = setInterval(function () { // 设置个定时任务 判断视频是否加载出来
        let video = document.getElementsByTagName("video")[0];
        if (video !== undefined) {
            if (parseInt(video.duration) === parseInt(video.currentTime) ||
                document.getElementsByClassName("mvp-time-display")[0].getElementsByTagName("span")[0].textContent
                ===
                document.getElementsByClassName("mvp-time-display")[0].getElementsByTagName("span")[1].textContent) {
                video.currentTime = 0; // 当进度满的时候重新播放该视频
            }
            setTimeout(function () { video.volume = 0; document.getElementsByClassName("mvp-toggle-play mvp-first-btn-margin")[0].click() }, 3000);
            video.onpause = function () { // 当视频被暂停后执行回调函数
                video.volume = 0;
                document.getElementsByClassName("mvp-toggle-play mvp-first-btn-margin")[0].click();
            }
            video.onended = function () { // 当视频播放完成执行回调函数
                gk_pageback();
            }
            clearInterval(myval);
        }
    }, 2000);
}

document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        // 页面加载完毕
        if (/https:\/\/lms.ouchn.cn\/course\/\d+\/ng.*#\//m.test(document.URL)) { // 判断是否在课程首页
            setInterval(function () {
                console.log("正在获取加载的课程~");
                if (document.getElementsByClassName("icon font font-toggle-all-collapsed").length > 0) {
                    document.getElementsByClassName("icon font font-toggle-all-collapsed")[0].click();
                }
                let alllearning = $(".learning-activity");
                for (let i = 0; i < alllearning.length; i++) {
                    let str = $(".learning-activity:eq(" + i + ") div.activity-operations-container .completeness").attr("tipsy-literal");
                    let zf = str.match(/^<b>(\W+)<\/b>/)[1];
                    let type = str.match(/^<b>\W+<\/b><\/br>(\W+)/)[1];
                    let typeEum = -1;
                    if (type === "完成指标：查看页面") {
                        typeEum = 1;
                    } else if (type.indexOf("完成指标：需累积观看") > -1) {
                        typeEum = 2;
                    } else if (type.indexOf("访问线上链接") > -1) {
                        typeEum = 3;
                    } else if (type.indexOf("完成指标：参与发帖或回帖") > -1) {
                        typeEum = 4;
                    } else if (type.indexOf("完成指标：观看或下载所有参考资料附件") > -1) {
                        typeEum = 5;
                    }
                    if (zf !== "已完成" && typeEum != -1) {
                        console.log("发现未完成的课程~");
                        document.cookie = "typeEum=" + typeEum;
                        switch (typeEum) {
                            case 2:
                                $(".learning-activity:eq(" + i + ")>div").click();
                                break;
                        }
                        break;
                    }
                }
            }, 5000);
        } else if (/https:\/\/lms.ouchn.cn\/course\/\d+\/learning-activity\/full-screen#\/\d+/m.test(document.URL)) {
            switch (Number(getCookie("typeEum"))) {
                case 2:
                    onVideo();
                    break;
            }
        }
    }
}
