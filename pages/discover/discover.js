var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var dboperation = require('../../utils/DBOperation.js');
var that,count = 10;
var app = getApp();
var currentUser;
Page({
  data: {
    label: ["板块", "小学", "初中", "高中", "大学本科", "硕士研究生", "博士研究生", "出国留学", "考级考试", "其它"],
    labelIndex: 0,
    rank: ["排序", "回答数排序"],
    rankIndex: 0,
    writeDiary: false,
    loading: true,
    limit: 10,
    questionList: [],
    modifyDiarys: false,
    userInfo: {},
    answererModal: false,
  },
  onLoad: function () {
    that = this;
    that.loadData(false);
    // var openId = wx.getStorageSync("user_openid")
    // //传参数金额，名称，描述,openid
    // Bmob.Pay.wechatPay(0.01, '名称1', '描述', openId).then(function (resp) {
    //   console.log('resp');
    //   console.log(resp);

    //   that.setData({
    //     loading: true,
    //     dataInfo: resp
    //   })

    //   //服务端返回成功
    //   var timeStamp = resp.timestamp,
    //     nonceStr = resp.noncestr,
    //     packages = resp.package,
    //     orderId = resp.out_trade_no,//订单号，如需保存请建表保存。
    //     sign = resp.sign;

    //   //打印订单号
    //   console.log(orderId);

    //   //发起支付
    //   wx.requestPayment({
    //     'timeStamp': timeStamp,
    //     'nonceStr': nonceStr,
    //     'package': packages,
    //     'signType': 'MD5',
    //     'paySign': sign,
    //     'success': function (res) {
    //       //付款成功,这里可以写你的业务代码
    //       console.log(res);
    //     },
    //     'fail': function (res) {
    //       //付款失败
    //       console.log('付款失败');
    //       console.log(res);
    //     }
    //   })

    // }, function (err) {
    //   console.log('服务端返回失败');
    //   common.showTip(err.message, 'loading', {}, 6000);
    //   console.log(err);
    // });
  },
  onShow: function () {
  },
  onShareAppMessage: function () {
    return {
      title: '壹元知享',
      desc: '壹元知享，是一个以分享教育信息和学术知识为核心的知识共享平台',
      path: '/pages/discover/discover'
    }
  },
  onPullDownRefresh: function () {
    count = 10
    this.setData({
      limit: 10
    })
    that.loadData(false);
  },
  onReachBottom: function () {
    var limit = count = that.data.limit + 10;
    this.setData({
      limit: limit
    })
    that.loadData(true);
  },
  loadData: function (isLoadMore) {
    if (!that.data.loading) {
      that.setData({
        loading: true,
      });
    }
    console.log(isLoadMore);
    var Question = Bmob.Object.extend("Question");
    var query = new Bmob.Query(Question);
    var rankIndex = that.data.rankIndex;
    console.log(rankIndex);
    if (isLoadMore) {
      query.skip(count);
    };
    // 查询所有数据
    query.equalTo("isPublic", true);
    if (that.data.labelIndex != 0) {
      query.equalTo("label", that.data.label[that.data.labelIndex]);
    }
    switch (rankIndex) {
      case "0":
        query.descending('createdAt');
        break;
      case "1":
        query.descending('answerNum');
        break;
      // case "1":
      //   query.descending('viewNum');
      //   break;
      default:
        query.descending('createdAt');
    }
    query.limit(that.data.limit);
    query.find({
      success: function (results) {
        // 循环处理查询到的数据
        var resultArr = isLoadMore ? that.data.questionList.concat(results) : results;
        console.log(resultArr);
        that.setData({
          questionList: resultArr,
          loading: false
        })
        wx.stopPullDownRefresh()
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
        that.setData({
          loading: false
        });
        wx.stopPullDownRefresh()
        wx.showToast({
          title: '获取数据失败',
        });
      }
    });

  },
  onLabelChange: function (e) {
    that = this;
    var mody = e.detail.value;
    var origin = this.data.labelIndex;
    if (mody != origin) {
      if (mody == 0) {
        common.showTip("已显示全部", "loading");
        that.setData({
          labelIndex: mody,
        })
      }
      else {
        common.showTip("已筛选" + that.data.label[mody], "loading");
        that.setData({
          labelIndex: mody,
        })
      }
    }
    that.loadData(false);
  },
  onRankChange: function (e) {
    that = this;
    var mody = e.detail.value;
    var origin = this.data.rankIndex;
    if (mody != origin) {
      // 改动:去除提示，并同步显示选项
      // if (mody == 0) {
      //     common.showModal("请选择排序方式");
      // }
      // else {
      common.showTip("已按照" + that.data.rank[mody] + "筛选", "loading");
      that.setData({
        rankIndex: mody,
      })
      // }
    }
    that.loadData(false);
  },
  toView: function (event) {
    that = this;
    var query = new Bmob.Query(Bmob.User);
    wx.getStorage({
      key: 'user_id',
      success: function (res) {
        dboperation.getUser(res.data).then((resData) => {
          if (resData.verified) {
            var dataset = event.currentTarget.dataset;
            wx.navigateTo({
              url: '../view/view?questionId=' + dataset.id,
            })
          } else {
            that.setData({
              answererModal: true,
            })
            console.log(that.data.answererModal);
          }
        }, () => {
          wx.showModal({
            title: '提示',
            content: '数据请求失败！',
            showCancel: false
          })
        });
      },
      fail: function (res) {
        that.setData({
          answererModal: true,
        })
      }
    })
  },
  toAsk: function (event) {
    that = this;
    var query = new Bmob.Query(Bmob.User);
    wx.getStorage({
      key: 'user_id',
      success: function (res) {
        query.equalTo("objectId", res.data);
        query.first({
          success: function (result) {
            // 循环处理查询到的数据
            console.log(result.attributes);
            // 结果信息包含在attribute中
            var resData = result.attributes;
            if (typeof resData == "object") {
              if (resData.verified) {
                var dataset = event.target.dataset;
                console.log(dataset.id);
                wx.navigateTo({
                  url: '../ask/ask',
                })
              } else {
                that.setData({
                  answererModal: true,
                })
              }
            } else {
              wx.showModal({
                title: '提示',
                content: '数据请求失败！',
                showCancel: false
              })
            };
          },
          error: function (error) {
            wx.showModal({
              title: '提示',
              content: '数据请求失败！',
              showCancel: false
            })
          }
        })
      },
      fail: function (res) {
        that.setData({
          answererModal: true,
        })
      }
    })
  },
  answererConfirm: function () {
    that.setData({
      answererModal: false,
    })
    wx.switchTab({
      url: '../account/account',
    })
  },
  answererCancel: function () {
    that.setData({
      answererModal: false,
    })
  }
})