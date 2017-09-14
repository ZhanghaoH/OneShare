//index.js
//获取应用实例
var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/common.js');
var reg_email = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
var reg_uni = /((学)|(学院)|(University)|(College))$/;
var dboperation = require('../../../utils/DBOperation.js');
var app = getApp();
var that;
var currentUser, cudata;
Page({
  data: {
    limit: 10,
    degree: ["初中", "高中", "本科", "硕士", "博士", "其它"],
    titleIndex: 0,
    userName: '',
    phoneNum: '',
    email: '',
    area: '',
    university: '',
    major: '',
  },
  onLoad: function () {
    that = this;
    if (Bmob.User.current()) {
      let cuserid = Bmob.User.current().id;
      dboperation.getUser(cuserid).then(res => {
        let username = res.username;
        that = this;
        that.setData({
          user: res,
          avatarUrl: res.userPic,
          nickName: username || nickName,
          qualify: res.verified
        })
      })
      var query = new Bmob.Query(Bmob.User);
      query.equalTo("objectId", cuserid);
      query.first({
        success: function (result) {
          // 循环处理查询到的数据
          console.log(result.attributes);
          // 结果信息包含在attribute中
          var resData = result.attributes;
          var arr_title = that.data.degree;
          console.log(arr_title);
          var index;
          arr_title.map((e, i) => {
            if (e == resData.title) {
              index = i;
            }
            ;
          });
          console.log(index);
          cudata = resData;
          if (typeof resData == "object") {
            that.setData({
              userName: resData.username,
              phoneNum: resData.mobilePhoneNumber,
              email: resData.email,
              area: resData.area,
              university: resData.university,
              major: resData.major,
              titleIndex: index,
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '数据请求失败！',
              showCancel: false
            })
          };
        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });
    }
  },
  onShareAppMessage: function () {
    return {
      title: '壹元知享',
      desc: '壹元知享，是一个以分享教育信息和学术知识为核心的知识共享平台',
      path: '/pages/discover/discover'
    }
  },
  updateInfo: function (e) {
    that = this;
    var info = e.detail.value;
    var txt_tips = "修改";
    info.title = that.data.degree[info.title];
    console.log(info);
    if (that.valid(info)) {
      for (let key in info) {
        if (cudata[key] == info[key]) {
          delete info[key];
        }
      };
      if (JSON.stringify(info) != "{}") {
        console.log(info);
        if (!cudata.verified) {
          info.verified = true;
          txt_tips = "认证";
        };
        that.aboutUpdate(info);
        dboperation.changeUser(that.data.userId, info).then(() => {
          common.showTip(txt_tips + '成功', 'success');
          if (!cudata.verified) {
            wx.switchTab({
              url: '../account',
            });
          }else {
            that.onLoad();
          };
        }, () => { common.showModal(txt_tips + "失败，请重新尝试"); })
      } else {
        that.setData({
          popText: "未做任何修改，不作修改点左上角返回"
        });
        that.popWarn();
      }
    }
  },
  filter: function (e) {
    let str = e.detail.value;
    return str.replace(/\s+/g, "");
  },
  // 表单验证
  valid: function (data) {
    if (data.username.length < 1) {
      that.setData({
        popText: "用户名为空"
      });
      that.popWarn();
      return false;
    };
    if (data.mobilePhoneNumber.length < 11) {
      that.setData({
        popText: "手机号格式错误"
      });
      that.popWarn();
      return false;
    };
    if (reg_email.exec(data.email) == null) {
      that.setData({
        popText: "邮箱格式错误"
      });
      that.popWarn();
      return false;
    };
    if (data.area == "") {
      that.setData({
        popText: "输入地址为空"
      });
      that.popWarn();
      return false;
    };
    if (data.university.length < 4 || reg_uni.exec(data.university) == null) {
      that.setData({
        popText: "请确认学校无误"
      });
      that.popWarn();
      return false;
    };
    if (data.major.length < 4) {
      that.setData({
        popText: "请确认专业无误"
      });
      that.popWarn();
      return false;
    };
    return true;
  },
  popWarn: function () {
    let animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    this.animation = animation;
    animation.height(20).opacity(1).step();
    this.setData({
      ani: animation.export(),
    })
    setTimeout(function () {
      animation.height(0).opacity(0).step();
      this.setData({
        ani: animation.export(),
      })
    }.bind(this), 1500);
  },
  onTitleChange: function (e) {
    that = this;
    var mody = e.detail.value;
    console.log(mody);
    var origin = that.data.titleIndex;
    if (mody != origin) {
      that.setData({
        titleIndex: mody,
      })
    }
  },
  aboutUpdate: function (obj) {
    console.log(obj)
    var a = dboperation.getBy("Answers", "publisherId", that.data.userId);
    var q = dboperation.getBy("Question", "publisherId", that.data.userId);
    Promise.all([a, q]).then(resData => {
      console.log(resData);
      resData[0].map(e => {
        dboperation.change("Answers", e.id, obj).then(() => { console.log("更新成功") }, () => { console.log("更新shibai") });
      });
      resData[1].map(e => {
        dboperation.change("Question", e.id, obj).then(() => { console.log("更新成功") }, () => { console.log("更新shibai") });
      });
    });
  },
})