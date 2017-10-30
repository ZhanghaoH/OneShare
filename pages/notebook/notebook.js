//index.js
//获取应用实例
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var dboperation = require('../../utils/DBOperation.js');
var currentUser = Bmob.User.current();
var app = getApp();
var that;
Page({
  data: {
    writeDiary: false,
    loading: false,
    windowHeight: 0,
    windowWidth: 0,
    aList: [],
    qList: [],
    modifyDiarys: false,
    userInfo: {},
    qMeList: [],
    showQlist: true,
    showAlist: true,
    showQMelist: true,
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
    var qList = that.data.qList;
    var aList = that.data.aList;
    dboperation.getBy("Question", "publisherId", user_id).then(resData => {
      console.log(resData);
      if (resData.length != 0) {
        resData.map((e, i) => {
          console.log(e);
          qList.push(e);
        })
        that.setData({
          qList: qList,
        })
      }
    });
    dboperation.getBy("Answers", "publisherId", user_id).then(resData => {
      console.log(resData);
      if (resData.length != 0) {
        resData.map((e, i) => {
          aList.push(e);
        });
        that.setData({
          aList: aList,
        })
      }
    });
    var qMeList = [];
    dboperation.getBy("Question", "caller", user_id).then(resData => {
      console.log(resData);
      if (resData.length != 0) {
        resData.map((e, i) => {
          qMeList.push(e);
        })
        that.setData({
          qMeList: qMeList,
        })
      }
    });
  },
  onShow: function (){
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    var user_id = Bmob.User.current().id;
    var qList = that.data.qList;
    var aList = that.data.aList;
    dboperation.getBy("Question", "publisherId", user_id).then(resData => {
      console.log(resData);
      if (resData.length != 0) {
        resData.map((e, i) => {
          qList.push(e);
        })
        that.setData({
          qList: qList,
        })
      }
    });
    dboperation.getBy("Answers", "publisherId", user_id).then(resData => {
      console.log(resData);
      if (resData.length != 0) {
        resData.map((e, i) => {
          console.log(e);
          aList.push(e);
        });
        that.setData({
          aList: aList,
        })
      }
    });
    var qMeList = [];
    dboperation.getBy("Question", "caller", user_id).then(resData => {
      console.log(resData);
      if (resData.length != 0) {
        resData.map((e, i) => {
          console.log(e);
          qMeList.push(e);
        })
        that.setData({
          qMeList: qMeList,
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
  showQlist: function () {
    that.setData({
      showQlist: !that.data.showQlist
    })
  },
  showAlist: function () {
    that.setData({
      showAlist: !that.data.showAlist
    })
  },
  showQMelist: function () {
    that.setData({
      showQMelist: !that.data.showQMelist
    })
  },
  delQuestionMe: function (e) {
    let objectId = e.currentTarget.dataset.id
    let Question = Bmob.Object.extend("Question");
    //创建查询对象，入口参数是对象类的实例
    var query = new Bmob.Query(Question);
    query.equalTo("objectId", objectId);
    query.destroyAll({
      success: function () {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          image: '',
          duration: 800,
          mask: true,
        })
       wx.redirectTo({
         url: '../notebook/notebook',
       })
      },
      error: function (err) {
        wx.showModal({
          title: '提示',
          content: '删除失败',
        })
      }
    });
  },
  delQuestion: function (e) {
    let objectId = e.currentTarget.dataset.id
    let Question = Bmob.Object.extend("Question");
    //创建查询对象，入口参数是对象类的实例
    var query = new Bmob.Query(Question);
    query.equalTo("objectId", objectId);
    query.destroyAll({
      success: function () {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          image: '',
          duration: 800,
          mask: true,
        })
       wx.redirectTo({
         url: '../notebook/notebook',
       })
      },
      error: function (err) {
        wx.showModal({
          title: '提示',
          content: '删除失败',
        })
      }
    });
  },
  delAnswer: function (e) {
    let objectId = e.currentTarget.dataset.id
    let Answers = Bmob.Object.extend("Answers");
    //创建查询对象，入口参数是对象类的实例
    var query = new Bmob.Query(Answers);
    query.equalTo("objectId", objectId);
    query.destroyAll({
      success: function () {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          image: '',
          duration: 800,
          mask: true,
        })
       wx.redirectTo({
         url: '../notebook/notebook',
       })
      },
      error: function (err) {
        wx.showModal({
          title: '提示',
          content: '删除失败',
        })
      }
    });

  },
})
