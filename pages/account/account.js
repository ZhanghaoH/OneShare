var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var dboperation = require('../../utils/DBOperation.js');
var app = getApp();
var currentUser, that, username, nickName;
Page({
  data: {
    userInfo: {},
    avatarUrl: "",
    nickName: username || nickName,
    user: {},
    qualify: false,
  },
  onLoad:function(){
    if (Bmob.User.current()) {
      let cuserid = Bmob.User.current().id;
      dboperation.getUser(cuserid).then(res => {
        username = res.username;
        that = this;
        that.setData({
          user: res,
          avatarUrl: res.userPic,
          nickName: username || nickName,
          qualify: res.verified
        })
      })
    }
  },
  onShow: function () {
    if (Bmob.User.current()) {
      let cuserid = Bmob.User.current().id;
      dboperation.getUser(cuserid).then(res => {
        username = res.username;
        that = this;
        that.setData({
          user: res,
          avatarUrl: res.userPic,
          nickName: username || nickName,
          qualify: res.verified
        })
      })
    }
  },

  userInfoHandler: function (e) {
    var that = this;
    wx.showLoading({
      title: '获取信息中...',
      mask: true,
    })
    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              //调用应用实例的方法获取全局数据
              wx.getUserInfo(function (resData) {
                console.log(resData)
                //更新数据
                nickName = resData.userInfo.nickName;
                that.setData({
                  userInfo: resData.userInfo,
                  avatarUrl: resData.userInfo.avatarUrl,
                  nickName: username || nickName
                });
              });
            },
            fail() {
              common.showModal("拒绝授权将无法完成认证，参与回答与提问问题,点击个人信息可重新授权认证");
            }
          })
        } else {
          console.log(e);
          nickName = e.detail.userInfo.nickName;
          that.setData({
            userInfo: e.detail.userInfo,
            avatarUrl: e.detail.userInfo.avatarUrl,
            nickName: username || nickName
          });
        };
        if (!wx.getStorageSync("login")) {
          // 注册
          wx.login({
            success: function (res) {
              if (res.code) {
                Bmob.User.requestOpenId(res.code, {
                  success: function (userData) {
                    wx.getUserInfo({
                      withCredentials: true,
                      lang: "zh_CN",
                      success: function (result) {
                        var userInfo = result.userInfo;
                        var nickName = userInfo.nickName;
                        var avatarUrl = userInfo.avatarUrl;
                        console.log(result);
                        console.log(userData);
                        Bmob.User.logIn(nickName, userData.openid, {
                          success: function (user) {
                            try {
                              wx.setStorageSync('user_openid', user.get("userData").openid)
                              wx.setStorageSync('user_id', user.id);
                              wx.setStorageSync('my_username', user.get("username"))
                              wx.setStorageSync('my_avatar', user.get("userPic"))
                            } catch (e) {
                            }
                            console.log("登录成功");
                            wx.navigateTo({
                              url: 'profile2/profile2',
                            });
                          },
                          //登录失败就注册
                          error: function (user, error) {
                            if (error.code == "101") {
                              var user = new Bmob.User();//开始注册用户
                              user.set("username", nickName);
                              user.set("password", userData.openid);//因为密码必须提供，但是微信直接登录小程序是没有密码的，所以用openId作为唯一密码    
                              // user.set("nickname", nickName);
                              user.set("userPic", avatarUrl);
                              user.set("userData", userData);
                              user.set("area", userInfo.province + userInfo.city + userInfo.country);
                              user.set("university", '')
                              user.set("major", '');
                              user.set("title", '');
                              user.set("formIds", []);
                              user.set("like", 0);//默认初始值为0                       
                              user.set("verified", false); //是否认证为回答者
                              user.signUp(null, {
                                success: function (results) {
                                  console.log("注册成功!");
                                  try {//将返回的3rd_session储存到缓存
                                    wx.setStorageSync('user_openid', results.get("userData").openid)
                                    wx.setStorageSync('user_id', results.id);
                                    wx.setStorageSync('my_username', results.get("username"));
                                    // wx.setStorageSync('my_nick', results.get("nickname"));
                                    wx.setStorageSync('my_avatar', results.get("userPic"))

                                  } catch (e) {
                                  }
                                  wx.navigateTo({
                                    url: 'profile2/profile2',
                                  });
                                },
                                error: function (userData, error) {
                                  console.log(error)
                                }
                              });
                            }
                          }
                        });
                      }
                    })
                  },
                  error: function (error) {
                    console.log("wx.login fail")
                    // Show the error message somewhere
                    console.log("Error: " + error.code + " " + error.message);
                  }
                });

              } else {
                console.log('获取用户登录态失败！' + res.errMsg)
              }
            }
          });

        }else{
          wx.navigateTo({
            url: 'profile2/profile2',
          });
        }
        wx.hideLoading()
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '壹元知享',
      desc: '壹元知享，是一个以分享教育信息和学术知识为核心的知识共享平台',
      path: '/pages/discover/discover'
    }
  },
})
