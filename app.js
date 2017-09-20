//app.js
// 在app.js中加入下面两行代码进行全局初始化
var Bmob = require('utils/bmob.js');
var common = require('utils/common.js');
Bmob.initialize("17e1d2db72b14e7ba1c76671fb1f736c", "93663e9db8c0fc729f195767f42d5b1b");

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    wx.setStorageSync('login', false);
    wx.login({
      success: function (res) {
        if (res.code) {
          Bmob.User.requestOpenId(res.code, {
            success: function (userData) {
              wx.getUserInfo({
                success: function (result) {
                  var userInfo = result.userInfo;
                  var nickName = userInfo.nickName;
                  var avatarUrl = userInfo.avatarUrl;
                  console.log(result);
                  Bmob.User.logIn(nickName, userData.openid, {
                    success: function (user) {
                      try {
                        wx.setStorageSync('user_openid', user.get("userData").openid)
                        wx.setStorageSync('user_id', user.id);
                        wx.setStorageSync('my_username', user.get("username"))
                        wx.setStorageSync('my_avatar', user.get("userPic"))
                        wx.setStorageSync('login', true)
                      } catch (e) {
                      }
                      console.log("登录成功");
                    },
                    //登录失败就注册
                    error: function (user, error) {
                      if (error.code == "101") {
                        common.showModal("登录失败或授权失败！请点击新页面中个人信息重新授权或按提示完善信息注册", "提示", () => {
                          wx.switchTab({
                            url: '../account/account',
                          })
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
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {

          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null
  }
})