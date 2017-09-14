//获取应用实例
var app = getApp()
var Bmob = require("../../utils/bmob.js");
var common = require('../../utils/common.js');
var dboperation = require('../../utils/DBOperation.js');
var currentUser;
var that;
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
      isPersonal: false,
      content: [],
      ishide: false,
      autoFocus: true,
      isLoading: false,
      published: true,
      loading: false,
      isdisabled: false,
      score: 60,
    },
    onLoad: function (options) {
      that = this;
      console.log(JSON.stringify(options.answer))
      var aid = JSON.parse(options.answer).id;
      var qid = JSON.parse(options.answer).qid;
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
        console.log(resData);
        that.setData({
          answer: resData,
          aId: aid,
        });
        let viewArr = resData.get("paiedId");
        let userId = currentUser.id;
        for(let i = 0, len = viewArr.length; i < len ; i++){
          if(viewArr[i].id == userId){
            that.setData({
              scored: viewArr[i].scored 
            })
          }
        }
        // if(that.data.answer.publisherId != currentUser.id){
          // var viewArr = that.data.answer.viewArr || [];
          // console.log(viewArr);
          // viewArr.push(currentUser.id);
          // var viewNum = viewArr.length;
          // console.log(viewArr);
          // console.log(currentUser.id);
          // var data = {"viewArr":viewArr,"viewNum":viewNum};
          // console.log(data);
          // var _as = dboperation.change("Answers",aid,data).then( () => {
          //   wx.hideLoading();
          // }) 
          // var _a = dboperation.getBy("Answers","punlisherId",that.data.answer.publisherId).then(resData => {
          //   resData.map(e => {
          //     dboperation.change("Answers", e.id, { "viewNum": viewNum});
          //   });
          // });
          // var _u = dboperation.getUser(that.data.answer.publisherId).then(resData => {
          //   dboperation.change("_User", resData.id, { "viewNum": viewNum });
          // });
        // }
      });
      //  Promise.all([q, a]).then((resData) => {
      //    console.log(resData);
      //  })
      //  console.log(that.data.answer.viewArr);
    },
    onReady: function () {
      wx.hideToast()
    },
    onShow: function () {
      var myInterval = setInterval(getReturn, 500);
      function getReturn() {
        wx.getStorage({
          key: 'user_openid',
          success: function (ress) {
            if (ress.data) {
              clearInterval(myInterval)
              that.setData({
                loading: true
              })
            }


          }
        })
      }
    },
    onShareAppMessage: function () {
      return {
        title: '壹元知享',
        desc: '壹元知享，是一个以分享教育信息和学术知识为核心的知识共享平台',
        path: '/pages/discover/discover'
      }
    },
    noneWindows: function () {
      that.setData({
        giveScore: false,
      })
    },
    setContent: function (e) {//问题内容
      that.setData({
        aContent: e.detail.value
      })
    },
    toScore: function (event) {
      that.setData({
        giveScore: true,
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
      var answer = that.data.answer.attributes;
      var score = that.data.score + answer.like;
      var data = { "like": score};
      console.log(answer.like);
      var ap = dboperation.change("Answers", that.data.aid, data);
      var up = dboperation.change("_User", that.data.publisherId, data);
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
          showCancel:false,
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../discover/discover',
              })
            }
          }
        })
      }, () => common.showModal('打分失败'));
    }
  })
