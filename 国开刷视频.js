// ==UserScript==
// @name        国开刷视频 - ouchn.cn
// @namespace   Violentmonkey Scripts
// @match       https://lms.ouchn.cn/course/*
// @grant       none
// @version     1.7
// @author  Ybond
// @license MIT
// @description 自动刷视频、查看网页（可能重复刷，页面会来回跳转）。你没有用过的船新版本!是兄弟就来砍我
// ==/UserScript==
let alllearning;
let nolearning = [];
let ns_player;
// 判断url是在课程首页
if (/https:\/\/lms.ouchn.cn\/course\/\d+\/ng#\//m.test(document.URL)) {
  // 判断全部展开按钮
  let cai = $(".expand-collapse-all-button>i");
  if (cai.hasClass("font-toggle-all-collapsed")) {
    cai.click();
  }
  // 加载所有课程
  setInterval(function () {
    ns_nostudy();
  }, 5000);
} else if (/https:\/\/lms.ouchn.cn\/course\/\d+\/learning-activity\/full-screen#\/\d+/m.test(document.URL)) {
  // 处理详情
  setTimeout(function () {
    // 2秒监控一次
    setInterval(function () {
      ns_player = $(".vjs-tech")[0];
      if (ns_player) {
        ns_playover();
        ns_start();
      } else {
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
    }
    if (zf === "未完成" && typeEum != -1) {
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

/** 视频操作 */

// 十秒后展开所有li
// setTimeout(() => {
//   ns_allclick();
// }, 10 * 1000);

/**
 *滚屏到最下面
 */
function ns_todown() {
  $(".___content").scrollTop(999999);
  $(document.getElementById("previewContentInIframe").contentWindow.document).scrollTop(999999);
  setTimeout(function () {
    ns_pageback();
  }, 5000);
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
  ns_player.playbackRate = 16;
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
    setTimeout(function () {
      ns_pageback();
    }, 5000);
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