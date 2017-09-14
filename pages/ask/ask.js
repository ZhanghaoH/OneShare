//获取应用实例
var app = getApp()
var Bmob = require("../../utils/bmob.js");
var common = require('../../utils/common.js');
var dboperation = require('../../utils/DBOperation.js');
var pay = require('../../utils/pay.js');
var that;
Page({
  data: {
    isPublic: false,
    label: ["请选择问答板块", "初中", "高中", "本科", "硕士", "博士", "其它"],
    labelIndex: "0",
    askerId: "",
    src: "",
    isSrc: false,
    title: "",
    thisLabel: "",
    content: "",
    ishide: false,
    autoFocus: true,
    published: true,
  },
  onLoad: function (options) {
    that = this;
    var userId = wx.getStorageSync("user_id"); //获取用户id
    // 是否指定回答者
    if (options.answerer) {
      var tmpUser = options.answerer;
      dboperation.getUser(tmpUser).then(resData => {
        console.log(resData);
        that.setData({
          caller: resData,
          callerId: tmpUser,
          isPublic: false,
        });
      })
    }

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
  changePublic: function (e) {//switch开关
    that = this;
    console.log(e.detail.value)
    if (e.detail.value == true) {
      wx.showModal({
        title: '公开问答',
        content: '您已将该问答设为公开（公开的问题将在围观模块出现，并且围观收入会进入你的钱包）',
        showCancel: true,
        confirmColor: "#e74c3c",
        cancelColor: "#646464",
        success: function (res) {
          if (res.confirm) {
            that.setData({
              ishide: false
            })
          }
          else {
            that.setData({
              isPublic: true
            })
          }
        }
      })

    }
    else {
      wx.showModal({
        title: '私有问答',
        content: '您已将该问答设为私有（私有的问答将从围观模块消失，并且不会有围观收入）',
        showCancel: true,
        confirmColor: "#e74c3c",
        cancelColor: "#646464",
        success: function (res) {
          if (res.confirm) {
            that.setData({
              ishide: true
            })
          }
          else {
            that.setData({
              isPublic: false
            })
          }
        }
      })

    }

  },
  onLabelChange: function (e) {
    that = this;
    var mody = e.detail.value;
    var origin = this.data.labelIndex;
    if (mody == "0") {
      common.showModal("请选择问答板块");
      return;
    }
    else {
      that.setData({
        labelIndex: mody,
      })
    }
    that.onShow();
  },
  setContent: function (e) {//问题内容
    that.setData({
      content: e.detail.value
    })
  },
  setTitle: function (e) {
    that.setData({
      title: e.detail.value
    })
  },
  sendNewQuestion: function (e) {//发布问题
    that = this;
    var content = that.data.content;
    var title = that.data.title;
    var labelIndex = that.data.labelIndex;
    var formId = e.detail.formId;
    // that.inform(formId);
    if (title == "") {
      common.showModal("标题不能为空");
      return;
    }
    else if (labelIndex == 0) {
      common.showModal("请选择问答板块");
      return;
    }
    else if (content == "") {
      common.showModal("问题内容不能为空");
      return;
    }
    else {
      wx.getStorage({
        key: 'user_openid',
        success: function (res) {
          pay.pay(0.01, '问题支付', '您将为发布问题支付相应费用', res.data).then(() => {
            that.setData({
              published: false,
            })
            wx.getStorage({
              key: 'user_id',
              success: function (ress) {
                var Question = Bmob.Object.extend("Question");
                var question = new Question();
                var query = new Bmob.Query(Bmob.User);
                var publisherPic = '';
                var publisherName = '';
                query.get(ress.data, {
                  success: function (result) {
                    publisherPic = result.get("userPic");
                    publisherName = result.get("username");
                    question.set("title", title);
                    question.set("content", content);
                    question.set("isPublic", !that.data.ishide);
                    question.set("caller", that.data.callerId);
                    question.set("publisher", publisherName);
                    question.set("publisherPic", publisherPic);
                    // question.set("isPersonal", that.data.isPersonal);
                    question.set("label", that.data.label[that.data.labelIndex]);
                    // question.set("viewNum", 0);
                    question.set("answerNum", 0);
                    question.set("publisherId", ress.data);
                    question.set("answers", []);
                    // question.set("isAnswered", false);
                    // question.set("answerer", that.data.user);
                    console.log(question);
                    question.save(null, {
                      success: function (result) {
                        that.setData({
                          published: true
                        });
                        wx.switchTab({
                          url: '../discover/discover',
                        });
                        // that.inform(formId);
                        // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
                        // common.showTip("成功发布问题", "success", function () {
                        //   wx.hideToast()
                        //   wx.redirectTo({
                        //     url: '../notebook/notebook',
                        //     complete: function (res) {
                        //       // complete
                        //     }
                        //   })
                        // });
                      },
                      error: function (result, error) {
                        // 添加失败
                        console.log(error)
                        common.showModal("发布问题失败");
                        that.setData({
                          published: true
                        })

                      }
                    });
                  },
                  error: function (error) {
                  }
                });
              }
            })

          })
        },
      })
    }
  },
  inform: function (formId) {
    console.log(formId);
    var currentUser = Bmob.User.current();
    var temp = {
      "touser": currentUser.get("openid"),
      "template_id": "B-2GcobfYnptevxY8G3SdA72YLYGZpOoJO_FEHlouWg",
      "page": "",
      "form_id": formId,
      "data": {
        "keyword1": {
          "value": "SDK测试内容",
          "color": "#173177"
        },
        "keyword2": {
          "value": "199.00"
        },
        "keyword3": {
          "value": "123456789"
        },
        "keyword4": {
          "value": "2015年01月05日 12:30"
        },
        "keyword5": {
          "value": "恭喜您支付成功，如有疑问请反馈与我"
        }
      },
      "emphasis_keyword": "keyword1.DATA"
    }
    Bmob.sendMessage(temp).then(function (obj) {
      console.log('发送成功')
    },
      function (err) {
        common.showTip('失败' + JSON.stringify(err));
      });
  }
})
