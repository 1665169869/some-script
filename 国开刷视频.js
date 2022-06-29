// ==UserScript==
// @name        国开刷视频 - ouchn.cn
// @namespace   Violentmonkey Scripts
// @match       https://lms.ouchn.cn/course/*
// @grant       none
// @version     1.5
// @author  Ybond
// @license MIT
// @description 自动刷视频，视频用16倍速静音播放，视频播放完毕自动播放专题下的下一个视频 如果下一个没解锁，自动播放当前视频
// ==/UserScript==

let ns_player = $(".vjs-tech")[0];

/**
 * 一秒监控一次播放
 **/
setInterval(function () {
  ns_player = $(".vjs-tech")[0];
  ns_playover();
  ns_start();
}, 1000)

/**
 * 播放方法
 **/
function ns_play() {
  ns_player.playbackRate = 16;
  ns_player.muted = true;
  ns_player.play();
}

/**
 * 判断是否暂停，如果暂停，就调用播放方法
 **/
function ns_start() {
  if (ns_player.paused) {
    ns_play();
  }
}

/**
 * 如果播放完毕，调用播放下一个视频的方法
 **/
function ns_playover() {
  if (ns_player.duration === ns_player.currentTime) {
    ns_playnext();
  }
}

/**
 * 播放下一个视频，如果有弹窗，那就播放当前视频
 **/
function ns_playnext() {
  let actlist = $(".activity-list>li");
  let flag = false;
  for (let i = 0; i < actlist.length; i++) {
    if (flag) {
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