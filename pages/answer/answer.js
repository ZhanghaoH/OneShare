//获取应用实例
var app = getApp();
var Bmob = require("../../utils/bmob.js");
var common = require('../../utils/common.js');
var dboperation = require('../../utils/DBOperation.js');
var that;
Page({
  data: {
    user: {},
    qId: "",
    publisherPic: "",
    answererPic: "",
    answerer: "",
    answererId: "",
    like: "",
    answererTitle: "",
    title: "",
    university: "",
    major: "",
    viewNum: 0,
    answerNum: 0,
    aContent: "",
    qContent: "",
    answerList: [],
    question: {},
    user: {},
    isPublic: true,
    isPersonal: false,
    content: "",
    ishide: false,
    autoFocus: true,
    isLoading: false,
    loading: false,
    published: true,
  },
  onLoad: function (options) {
    that = this;
    console.log(options.questionId);
    var Qid = options.questionId;
    dboperation.getById("Question", Qid).then((resData) => {
      console.log(resData);
      var resData = resData.attributes;
      that.setData({
        qContent: resData.content,
        qId: Qid,
        publisher: resData.publisher,
        publisherPic: resData.publisherPic,
        title: resData.title,
        label: resData.label,
        viewNum: resData.viewNum,
        answerList: resData.answers || [],
        answerNum: resData.answerNum,
        isPublic: resData.isPublic,
        loading: true,
      });
    });
    var user_id = wx.getStorageSync("user_id");
    that.setData({
      user_id: user_id
    });
    dboperation.getUser(user_id).then((resData) => {
      console.log(resData);
      // var resData = resData.attributes;
      that.setData({
        answerer: resData.username,
        answererPic: resData.userPic,
        answererTitle: resData.title,
        university: resData.university,
        major: resData.major,
        like: resData.like,
      });
    })
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
  setContent: function (e) {//问题内容
    that.setData({
      aContent: e.detail.value
    })
  },
  sendNewAnswer: function (e) {//发布回答
    that = this;
    var content = e.target.dataset.content.replace(/\s+/g, " ");
    if (content == "") {
      common.showModal("回答内容不能为空！");
    }
    else {
      that.setData({
        isLoading: true,
        published: false
      });
      var answers = that.data.answerList;
      var arr = [];
      arr.push({ "id": that.data.user_id, "isScored": false});
      console.log(arr);
      var answerObj = { 
        "questionId": that.data.qId, 
        "publisherId": that.data.user_id, 
        "content": content, 
        "viewNum": 0, 
        "viewArr": [], 
        "paiedId": arr,
        "label": that.data.answererTitle,
        "major": that.data.major,
        "like": that.data.like,
        "publisherPic": that.data.answererPic,
        "publisher": that.data.answerer
        };
      console.log(answers);
      dboperation.add("Answers", answerObj).then((resData) => {
        // var ans = {
        //   "aid": resData,
        //   "viewNum": 0,
        //   "paiedId": [that.data.user_id],
        //   "label": that.data.answererTitle,
        //   "like": that.data.like,
        //   "publisherPic": that.data.answererPic,
        //   "publisher": that.data.answerer
        // };
        answers.push(resData);
        dboperation.change("Question", that.data.qId, { "answers": answers,"answerNum": answers.length }).then(() => {
          that.setData({
            isLoading: false,
            published: true
          });
          wx.redirectTo({
            url: '../view/view?questionId='+ that.data.qId,
          });
        }, () => {
          that.setData({
            isLoading: false,
            published: true
          });
          common.showModal("出现错误，请重新尝试");
        })
      });
      // var Answer = Bmob.Object.extend("answer");
      // var answer = new Answer();
      // answer.set("content", content);
      // answer.set("isPublic", !that.data.ishide);
      // answer.set("publisherId", that.data.answererId);
      // answer.set("publisher", that.data.answerer);
      // answer.set("publisherPic", that.data.answererPic);
      // answer.set("publisherUniversity", that.data.university);
      // answer.set("publisherTitle", that.data.answererTitle);
      // answer.set("publisherLike", that.data.likeNum);
      // answer.set("publisherMajor", that.data.major);
      // answer.set("questionId", that.data.qId),
      //   answer.set("viewNum", 0);
      // answer.set("likeNum", 0);
      // answer.save(null, {
      //   success: function (result) {
      //     if (that.data.question.get("isAnswered") == false) {
      //       that.data.question.set("isAnswered", true);
      //       that.data.question.set("answerNum", 1);
      //       that.data.question.save(null, {
      //         success: function (result) {
      //           console.log("updata answerNum succeed!");
      //           common.showTip("成功发布问题", "success", function () {
      //             wx.hideToast()
      //             wx.redirectTo({
      //               url: '../notebook/notebook',
      //               complete: function (res) {
      //                 // complete
      //               }
      //             })
      //           });
      //         },
      //         error: function (error) {
      //           console.log("error", error);
      //           common.showModal("出现错误，请重新尝试");
      //         }
      //       })
      //     }
      //     else {
      //       var query = Bmob.Query(Answer);
      //       query.equalTo("questionId", that.data.qId);
      //       query.count({
      //         success: function (count) {
      //           that.data.question.set("answerNum", count);
      //           that.data.question.save(null, {
      //             success: function (result) {
      //               console.log("updata answerNum succeed!");
      //             },
      //             error: function (error) {
      //               console.log("error", error);
      //               common.showModal("出现错误，请重新尝试");
      //             }
      //           })
      //         }
      //       })
      //     }
      //     that.setData({
      //       isLoading: false,
      //       published: true
      //     })
      //   },
      //   error: function (error) {
      //     console.log("error", error);
      //     common.showModal("出现错误，请重新尝试");
      //     that.setData({
      //       isLoading: false,
      //       published: true
      //     })
      //   }
      // })
    }
  }
})
