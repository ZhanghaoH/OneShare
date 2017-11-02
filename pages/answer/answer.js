//获取应用实例
var app = getApp();
var Bmob = require("../../utils/bmob.js");
var util = require("../../utils/util.js");
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
    ques: "",
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
    strLen: 0,
    published: true,
  },
  onLoad: function (options) {
    that = this;
    // 问题id
    var Qid = options.questionId;
    dboperation.getById("Question", Qid).then((resData) => {
      console.log(resData);
      var resData = resData.attributes;
      that.setData({
        qContent: resData.content,
        qId: Qid,
        publisher: resData.publisher,
        publisherPic: resData.publisherPic,
        ques: resData.ques,
        label: resData.label,
        viewNum: resData.viewNum,
        answerList: resData.answers || [],
        answerNum: resData.answerNum,
        isPublic: resData.isPublic,
        loading: true,
        imgArr: resData.images,
        // 问题发布者的id
        publisherId: resData.publisherId
      });
      // 获取问题发布者formId，有答案时直接借用formId推送
      dboperation.getUser(resData.publisherId).then((resData) => {
        console.log(resData);
        // var resData = resData.attributes;
        that.setData({
          userData: resData.userData,
          toformIds: resData.formIds
        });
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
        formIds: resData.formIds
      });
    })
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
      aContent: e.detail.value,
      strLen: e.detail.value.length,
    })
  },
  sendNewAnswer: function (e) {//发布回答
    that = this;
    var formId = e.detail.formId;
    var content = that.data.aContent.replace(/\s+/g, " ");
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
      arr.push({ "id": that.data.user_id, "isScored": true });
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
        answers.push(resData);
        dboperation.change("Question", that.data.qId, { "answers": answers, "answerNum": answers.length }).then(() => {
          that.setData({
            isLoading: false,
            published: true
          });
          dboperation.changeUser(that.data.user_id, { "formIds": that.data.formIds.push(formId) }).then(() => {
            console.log('反馈成功', 'success');
          }, (err) => { console.log("失败，请重新尝试：" + err.message); })
          // 发送模板消息
          that.inform()
          wx.redirectTo({
            url: '../view/view?questionId=' + that.data.qId,
          });
        }, () => {
          that.setData({
            isLoading: false,
            published: true
          });
          common.showModal("出现错误，请重新尝试");
        })
      });
    }
  },
  inform: function () {
    console.log(that.data.userData.openid)
    if (that.data.toformIds.length > 0) {
      var temp = {
        "touser": that.data.userData.openid,
        "template_id": "ku15Yz6RyCHEQ04hc-pC-y3U2MJ2GYHYHp-JIrEUU9w",
        "page": "pages/view/view?questionId=" + that.data.qId,
        "form_id": that.data.toformIds[0],
        "data": {
          "keyword1": {
            "value": that.data.answerer,
          },
          "keyword2": {
            "value": that.data.aContent,
            "color": "#666666"
          },
          "keyword3": {
            "value": "回答"
          },
          "keyword4": {
            "value": util.formatTime(new Date())
          },
        },
        "emphasis_keyword": ""
      }
      that.data.formIds.shift()
      dboperation.changeUser(that.data.userId, { "formIds": that.data.toformIds }).then(() => {
        Bmob.sendMessage(temp).then(function (obj) {
          console.log('发送成功')
        }, function (err) {
          common.showTip('失败' + JSON.stringify(err));
        });
      }, (err) => { common.showModal(txt_tips + "失败，请重新尝试：" + err.message); })
    }
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
