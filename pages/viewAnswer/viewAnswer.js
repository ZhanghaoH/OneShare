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
      askAgain: true,
      imgArr: []
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
          publisherPic: resData.get('publisherPic'),
          publisher: resData.get('publisher'),
          publisherId: resData.get('publisherId'),
          title: resData.get('title'),
          label: resData.get('label'),
          viewNum: resData.get('viewNum'),
          answerList: resData.get('answers') || [],
          answerNum: resData.get('answerNum'),
          isPublic: resData.get('isPublic'),
          loading: true,
          imgArr: resData.get('images')
        });
      });
      // 获取相关答案信息
      var a = dboperation.getById("Answers", aid).then(resData => {
        that.setData({
          answer: resData.attributes,
          aId: aid,
        });
        console.log(resData)
        let viewArr = resData.get("paiedId");
        let userId = currentUser.id;
        for (let i = 0, len = viewArr.length; i < len; i++) {
          if (viewArr[i].id == userId) {
            console.log(viewArr[i])
            that.setData({
              scored: viewArr[i].isScored,
            })
          }
        }
        if(resData.get('publisherId') == userId){
          that.setData({
            askAgain: false
          })
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
      console.log(answer)
      var score = that.data.score + answer.like;
      // var score = that.data.score;
      console.log(score);
      // 获取相关答案信息
      var a = dboperation.getById("Answers", aid).then(resData => {
        let viewArr = resData.get("paiedId");
        let userId = currentUser.id;
        for (let i = 0, len = viewArr.length; i < len; i++) {
          if (viewArr[i].id == userId) {
            viewArr[i].isScored = true
          }
        }
        console.log(viewArr)
        var data = { "like": score, "paiedId": viewArr };
        var ap = dboperation.change("Answers", that.data.aId, data);
        console.log(answer.publisherId)
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
                // that.onShow()
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
    },
    // 预览图片
    showImg: function (e) {
      var index = e.currentTarget.dataset.index
      var tempUrlArr = that.data.imgArr
      wx.previewImage({
        urls: tempUrlArr,
        current: tempUrlArr[index]
      })

    }
  })
