//index.js
//获取应用实例
var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/common.js');
var dboperation = require('../../../utils/DBOperation.js');
var currentUser = Bmob.User.current();
var app = getApp();
var that;
Page({
  data: {
    writeDiary: false,
    loading: false,
    windowHeight: 0,
    windowWidth: 0,
    modifyDiarys: false,
    userInfo: {},
  },
  onLoad: function () {
    that = this;
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    var user_id = Bmob.User.current().id;
    var qList = [];
    dboperation.getBy("Question", "caller", user_id).then(resData => {
      console.log(resData);
      if(resData.length != 0){
        resData.map((e, i) => {
          console.log(e);
          qList.push(e);
        })
        that.setData({
          qList: qList,
        })
      }
    });
  },
  onShareAppMessage: function () {
    return {
      title: '壹元知享',
      desc: '壹元知享，是一个以分享教育信息和学术知识为核心的知识共享平台',
      path: '/pages/discover/discover'
    }
  },
})
