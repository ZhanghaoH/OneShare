
//获取应用实例
var app = getApp()
var Bmob = require("../../utils/bmob.js");
var common = require('../../utils/common.js');
var pay = require('../../utils/pay.js');
var dboperation = require('../../utils/DBOperation.js');
var that, user_id, tip_str, a_p_id;
const btnText = [
  { id: 0, text: "回答问题" },
  { id: 1, text: "补充问题" },
  { id: 2, text: "完善答案" },
]
Page({
  data: {
    user: {},
    qId: "",
    publisherPic: "../../image/profile.png",
    publisher: "",
    publisherId: "",
    ques: "",
    viewNum: 0,
    answerNum: 0,
    qContent: "",
    question: {},
    answerList: [],
    user: {},
    content: "",
    autoFocus: true,
    // tipStr: btnText[0]
  },
  onLoad: function (options) {
    that = this;
    user_id = wx.getStorageSync("user_id");
    var Qid = options.questionId;
    that.setData({
      user_id: user_id
    });
    dboperation.getUser(user_id).then((resData) => {
      console.log(resData);
      that.setData({
        answerer: resData.username,
        answererPic: resData.userPic,
        answererTitle: resData.title,
        university: resData.university,
        major: resData.major,
        likeNum: resData.like,
      });
    });
    dboperation.getById("Question", Qid).then((resData) => {
      console.log(resData);
      var resData = resData.attributes;
      that.setData({
        qContent: resData.content,
        qId: Qid,
        publisherPic: resData.publisherPic,
        // 提问者ID
        publisherId: resData.publisherId,
        publisher: resData.publisher,
        ques: resData.ques,
        label: resData.label,
        viewNum: resData.viewNum,
        // answerList: resData.answers || [],
        answerNum: resData.answerNum,
        isPublic: resData.isPublic,
        loading: true,
        imgArr: resData.images
      });
      // 根据当前浏览者确定可执行操作
      console.log(user_id + "--" + that.data.publisher)
      if (user_id == that.data.publisherId) {
        that.setData({
          tipStr: btnText[1],
          istoAnswer: false
        })
      }
      var answers = resData.answers;  //问题答案
      console.log(answers);
      var answerList = [];
      if (answers.length != 0) {
        answers.map((e, i) => {
          console.log(e);
          dboperation.getById("Answers", e).then(resData => {
            console.log(resData.get("publisherId"))
            a_p_id = resData.get("publisherId")
            answerList.push(resData);
            if (user_id == resData.get("publisherId")) {
              that.setData({
                // tipStr: btnText[2],
                istoAnswer: true,
              })
            }
            console.log(answerList);
            that.setData({
              answerList: answerList || [],
            })
          })
        });
      }
    });
    that.setData({
      tipStr: btnText[0],
      istoAnswer: false,
    })
  },
  onShareAppMessage: function () {
    return {
      title: '壹元知享',
      desc: '壹元知享，是一个以分享教育信息和学术知识为核心的知识共享平台',
      path: '/pages/view/view'
    }
  },
  toViewAnswer: function (event) {
    that = this;
    console.log(event)
    var dataset = event.currentTarget.dataset;
    that.toViewAnswerPage(dataset);
  },
  toViewAnswerPage: function (dataset) {
    var answer = { "id": dataset.id, "qid": dataset.qid };
    wx.getStorage({
      key: 'user_openid',
      success: function (res) {
        var openId = res.data;
        var arrPay = [];
        dboperation.getById("Answers", dataset.id).then(res => {
          // console.log(res.get("paiedId"));
          arrPay = arrPay.concat(res.get("paiedId"));
          // 当前用户id已经在已支付列表中就免支付，直接看答案
          if (arrPay.some(el => el.id === user_id)) {
            wx.navigateTo({ url: '../viewAnswer/viewAnswer?answer=' + JSON.stringify(answer), });
            return new Promise((resolve, reject) => { reject(); })
          } else {
            return pay.pay(0.01, '问题支付', '您将为发布问题支付相应费用', openId)
          }
        }).then(() => {
          let nobj = { "id": user_id, "isScored": false };
          // console.log(arrPay.some(el => el.id === a_p_id))
          // if (!arrPay.some(el => el.id === a_p_id)) {
            arrPay.push(nobj);
            console.log("修改围观人数了")
            return dboperation.change("Answers", dataset.id, { "paiedId": arrPay, "viewNum": arrPay.length - 1 });
          // }
        }).then(() => {
          wx.navigateTo({ url: '../viewAnswer/viewAnswer?answer=' + JSON.stringify(answer) });
        }).catch(() => console.log('err'));
      },
    })
  },
  // 问题下的功能操作
  toAnswer: function (event) {
    var tipId = that.data.tipStr.id;
    switch (tipId) {
      // 回答问题
      case 0:
        wx.redirectTo({
          url: '../answer/answer?questionId=' + that.data.qId,
        })
        break;
      // 补充问题
      case 1:
        wx.navigateTo({
          url: '../ask/ask?questionId=' + that.data.qId,
        })
        break;
      // // 完善答案
      // case 2:
      //   break;
      default:
        break;
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

