// ==UserScript==
// @name        国开刷视频 二改 - ouchn.cn
// @namespace   Violentmonkey Scripts
// @match       https://lms.ouchn.cn/course/*
// @grant       none
// @version     1.0.0
// @author  原作者：Ybond 二改：白羽
// @license MIT
// @description 自动刷视频、查看网页、自动点击链接，自动发表帖子(好好学习)，自动查看文件，（课程可能重复刷，页面会来回跳转）。你没有用过的船新版本!是兄弟就来砍我
// ==/UserScript==
let alllearning;
let nolearning = [];
let ns_player;
let dbg = true;

document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
        // 页面加载完毕
        let myval = setInterval(function () {
            let video = document.getElementsByTagName("video")[0];
            if (video !== undefined) {
                if (parseInt(video.duration) !== parseInt(video.currentTime) ||
                    document.getElementsByClassName("mvp-time-display")[0].getElementsByTagName("span")[0].textContent
                    !==
                    document.getElementsByClassName("mvp-time-display")[0].getElementsByTagName("span")[1].textContent) {
                    setTimeout(function () { document.getElementsByClassName("mvp-toggle-play mvp-first-btn-margin")[0].click() }, 3000);
                }
                video.onpause = function () {
                    document.getElementsByClassName("mvp-toggle-play mvp-first-btn-margin")[0].click();
                }
                clearInterval(myval);
            }
        }, 2000);
    }
}

// 判断url是在课程首页
if (/https:\/\/lms.ouchn.cn\/course\/\d+\/ng#\//m.test(document.URL)) {
    nsd("当前在课程首页");
    // 判断全部展开按钮
    let cai = $(".expand-collapse-all-button>i");
    if (cai.hasClass("font-toggle-all-collapsed")) {
        nsd("点击全部展开");
        cai.click();
    }
    // 加载所有课程
    setInterval(function () {
        nsd("获取所有课程");
        ns_nostudy();
    }, 5000);
} else if (/https:\/\/lms.ouchn.cn\/course\/\d+\/learning-activity\/full-screen#\/\d+/m.test(document.URL)) {
    nsd("在详情页");
    // 处理详情
    setTimeout(function () {
        // 2秒监控一次
        setInterval(function () {
            ns_player = $(".vjs-tech")[0];
            if (ns_player) {
                nsd("页面有视频")
                ns_playover();
                // ns_start();
            } else {
                nsd("页面没视频")
                ns_todown();
            }
        }, 5000);
    }, 15000);
}

// 上一页
function ns_pageback() {
    history.back(-1);
}

// 获取所有课程
function ns_nostudy() {
    alllearning = $(".learning-activity");
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
            $(".learning-activity:eq(" + i + ")>div").click();
            break;
            // nolearning.push({
            //   type: typeEum,
            //   id:$(".learning-activity:eq("+i+")").attr("id").replace("learning-activity-",""),
            //   jq:$(".learning-activity:eq("+i+")")
            // })
        }
    }
}

function ns_back(nb) {
    setTimeout(function () {
        ns_pageback();
    }, nb ? nb : 5000);
}

/** 视频操作 */

// 十秒后展开所有li
// setTimeout(() => {
//   ns_allclick();
// }, 10 * 1000);

var ns_pl = false;

/**
 *滚屏到最下面
 */
function ns_todown() {
    if ($(".open-link-button").html() && $(".open-link-button").html().indexOf("新页签打开") > -1) {
        nsd("处理点击链接")
        $(".open-link-button>i").click();

        ns_back();
    } else if ($(".embeded-new-topic").html() && $(".embeded-new-topic").html().indexOf("发表帖子") > -1 && !ns_pl) {
        nsd("处理发表帖子")
        $(".embeded-new-topic>i").click();
        $("#add-topic-popup > div > div.topic-form-section.main-area > form > div:nth-child(1) > div.field > input").val("好好学习").trigger('change');
        setTimeout(function () {
            $("#add-topic-popup > div > div.popup-footer > div > button.button.button-green.medium").click();
            ns_pl = true;

            ns_back(10000);
        }, 1000);
    } else if ($("div.attachment-column.column.large-3 a:eq(0)")[0]) {
        nsd("处理文件预览")
        $("div.attachment-column.column.large-3 a:eq(0)").click();

        ns_back();
    } else {
        nsd("处理其他")
        $(".___content").scrollTop(999999);
        $(document.getElementById("previewContentInIframe").contentWindow.document).scrollTop(999999);

        ns_back();
    }
}

/**
 * 点击所有li
 */
function ns_allclick() {
    let ali = $(".module-list>ul>li>div");
    for (let index = 0; index < ali.length; index++) {
        const element = ali[index];
        $(element).click();
    }
}

/**
 * 播放方法
 */
function ns_play() {
    ns_player.playbackRate = 1;
    ns_player.muted = true;
    $("div.mvp-replay-player-all-controls > div.mvp-controls-left-area > button > i").click();
}

/**
 * 判断是否暂停，如果暂停，就调用播放方法
 */
function ns_start() {
    if (ns_player.paused && ns_player.duration !== ns_player.currentTime) {
        ns_play();
    }
}

/**
 * 如果播放完毕，调用播放下一个视频的方法
 */
function ns_playover() {
    if (ns_player.duration === ns_player.currentTime) {
        ns_back();
    }
}

/**
 * 播放下一个视频，如果有弹窗，那就播放当前视频
 */
function ns_playnext() {
    let actlist = $(".activity-list>li");
    let flag = false;
    for (let i = 0; i < actlist.length; i++) {
        if (flag) {
            if ($($(".activity-list>li")[i]).parent().parent().find("> div > div > span").text() != "视频学习") {
                continue;
            }
            $(".activity-list>li:eq(" + i + ")>div").click();
            let popup = $(".prerequisites-confirmation-popup");
            for (let j = 0; j < popup.length; j++) {
                if (popup[j].style.display === "block") {
                    $(".prerequisites-confirmation-popup:eq(" + j + ") .form-buttons>button").click();
                    ns_play();
                    break;
                }
            }
            break;
        }
        if ($(actlist[i]).hasClass("active")) {
            flag = true;
        }
    }
}

function nsd(str) {
    if (dbg) {
        console.log(str);
    }
}
