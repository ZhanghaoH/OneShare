//获取应用实例
var app = getApp()
var Bmob = require("../../utils/bmob.js");
var common = require('../../utils/common.js');
var dboperation = require('../../utils/DBOperation.js');
var currentUser;
var that, aid, qid;
Page(
  {
    data: {
      user: {},
      aId: "",
      qId: "",
      answer: {},
      question: {},
      publisher: {},
      scored: false,
      isPublic: true,
      content: [],
      ishide: false,
      autoFocus: true,
      isLoading: false,
      published: true,
      loading: false,
      isdisabled: false,
      score: 60,
      askAgain: true
    },
    onLoad: function (options) {
      that = this;
      console.log(JSON.stringify(options.answer))
      aid = JSON.parse(options.answer).id;
      qid = JSON.parse(options.answer).qid;
      wx.showLoading({
        title: '页面加载中...',
      });
      currentUser = Bmob.User.current();
      console.log(aid);
      console.log(qid);
      // 获取相关问题信息
      var q = dboperation.getById("Question", qid).then((resData) => {
        console.log(resData);
        that.setData({
          question: resData,
          qContent: resData.content,
          qId: qid,
          publisherPic: resData.publisherPic,
          publisher: resData.publisher,
          publisherId: resData.publisherId,
          title: resData.title,
          label: resData.label,
          viewNum: resData.viewNum,
          answerList: resData.answers || [],
          answerNum: resData.answerNum,
          isPublic: resData.isPublic,
          loading: true,
        });
      });
      // 获取相关答案信息
      var a = dboperation.getById("Answers", aid).then(resData => {
        that.setData({
          answer: resData.attributes,
          aId: aid,
        });
        let viewArr = resData.get("paiedId");
        let userId = currentUser.id;
        for (let i = 0, len = viewArr.length; i < len; i++) {
          if (viewArr[i].id == userId) {
            that.setData({
              scored: true,
              askAgain: false
            })
          }
        }
      });
    },
    onReady: function () {
      wx.hideToast()
    },
    onShareAppMessage: function () {
      return {
        title: '壹元知享',
        desc: '壹元知享，是一个以分享教育信息和学术知识为核心的知识共享平台',
        path: '/pages/discover/discover'
      }
    },
    setContent: function (e) {//问题内容
      that.setData({
        aContent: e.detail.value
      })
    },
    sliderChange: function (e) {
      that.setData({
        score: e.detail.value,
      })
      console.log(that.data.score);
    },
    modifyScore: function (e) {
      console.log("modify score to: " + that.data.score);
      var answer = that.data.answer;
      var score = that.data.score + answer.like;
      console.log(answer.like);
      // 获取相关答案信息
      var a = dboperation.getById("Answers", aid).then(resData => {
        let viewArr = resData.get("paiedId");
        let userId = currentUser.id;
        for (let i = 0, len = viewArr.length; i < len; i++) {
          if (viewArr[i].id == userId) {
            viewArr[i].isScored = true
          }
        }
        var data = { "like": score, "paiedId": viewArr };
        var ap = dboperation.change("Answers", that.data.aid, data);
        var up = dboperation.change("_User", answer.publisherId, { "like": score });
        Promise.all([ap, up]).then((res) => {
          console.log(res);
          that.setData({
            answer: res[0],
            giveScore: false,
            score: score,
          });
          wx.showModal({
            title: '提示',
            content: '打分成功',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '../discover/discover',
                })
              }
            }
          })
        }, () => common.showModal('打分失败'));
      })
    },
    askpro: function () {
      var answer = that.data.answer;
      wx.navigateTo({
        url: '../askpro/askpro?answerer=' + answer.publisherId,
      })
    }
  })
