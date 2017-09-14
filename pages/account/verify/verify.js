// pages/other/other.js
var that;
var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/common.js');
var app = getApp();
var currentUser = Bmob.User.current();
Page({
  data: {
    userInfo: {},
    urlArr1: {},
    urlArr2: {},
    urlArr3: {},
    loading: true,
    status: ["图片已上传", "请上传证件照片"],
    statusIndex1: 0,
    statusIndex2: 0,
    statusIndex3: 0,
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      console.log(userInfo)
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  toProfile: function () {
    wx.navigateTo({
      url: '../profile/profile',
      complete: function(res) {
        // complete
      }
    })
  },
  verifyOK: function () {
    var profileDone = currentUser.get("areaIndex")!=0 && currentUser.get("universityIndex")!=0 && currentUser.get("titleIndex")!=0 && currentUser.get("");

    if (this.data.statusIndex1 + this.data.statusIndex2 + this.data.statusIndex3 < 2) {
      common.showModal("请至少上传两张有效证件照片！");
    }
    else {
      currentUser.set("applyVerify", true);
      currentUser.save(null, {
        success: function (result) {
          common.showTip('您的回答者申请已提交，请耐心等待审核', 'success');
          wx.redirectTo({
            url: '../discover/discover',
            complete: function(res) {
              // complete
            }
          })
        },
        error: function (result, error) {
          common.showModal("网络错误，请重新尝试。");
        }
      });
    }
  },
  delImg1: function () {//图片删除
    var path;
    var that = this;
    path = this.data.urlArr1[0].url;
    var s = new Bmob.Files.del(path).then(function (res) {
      if (res.msg == "ok") {
        console.log('删除成功');
        common.showModal("删除成功！");
      }
      console.log(res);
    }, function (error) {
      console.log(error);
      common.showModal("录取通知书照片已删除！");
    }
    );
    that.setData({
      statusIndex1: 1,
    })
  },
  delImg2: function () {//图片删除
    var path;
    var that = this;
    path = this.data.urlArr2[0].url;
    var s = new Bmob.Files.del(path).then(function (res) {
      if (res.msg == "ok") {
        console.log('删除成功');
        common.showModal("删除成功！");
      }
      console.log(res);
    }, function (error) {
      console.log(error);
      common.showModal("学生证照片已删除！");
    }
    );
    that.setData({
      statusIndex2: 1,
    })
  },
  delImg3: function () {//图片删除
    var path;
    var that = this;
    path = this.data.urlArr3[0].url;
    var s = new Bmob.Files.del(path).then(function (res) {
      if (res.msg == "ok") {
        console.log('删除成功');
        common.showModal("删除成功！");
      }
      console.log(res);
    }, function (error) {
      console.log(error);
      common.showModal("校园卡照片已删除！");
    }
    );
    that.setData({
      statusIndex3: 1,
    })
  },
  upImg1: function () {
    var that = this;
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          loading: false
        })
        var urlArr1 = new Array();
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        var imgLength = tempFilePaths.length;
        if (imgLength > 0) {

          for (var i = 0; i < imgLength; i++) {
            var tempFilePath = [tempFilePaths[0]];
            var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
            if (extension) {
              extension = extension[1].toLowerCase();
            }

            var name = currentUser.id + "." + extension;//上传的图片的别名      

            var file = new Bmob.File(name, tempFilePath);
            file.save().then(function (res) {
              var url = res.url();
              urlArr1.push({ "url": url });
              that.setData({
                loading: true,
                urlArr1: urlArr1,
                statusIndex1: 0,
              })

            }, function (error) {
              console.log(error)
            });

          }
        }
      }
    })
  },
  upImg2: function () {
    var that = this;
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          loading: false
        })
        var urlArr2 = new Array();
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        var imgLength = tempFilePaths.length;
        if (imgLength > 0) {

          for (var i = 0; i < imgLength; i++) {
            var tempFilePath = [tempFilePaths[0]];
            var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
            if (extension) {
              extension = extension[1].toLowerCase();
            }

            var name = currentUser.id + "." + extension;//上传的图片的别名      

            var file = new Bmob.File(name, tempFilePath);
            file.save().then(function (res) {
              var url = res.url();

              urlArr2.push({ "url": url });
              that.setData({
                loading: true,
                urlArr2: urlArr2,
                statusIndex2: 0,
              })

            }, function (error) {
              console.log(error)
            });

          }
        }
      }
    })
  },
  upImg3: function () {
    var that = this;
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          loading: false
        })
        var urlArr3 = new Array();
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        var imgLength = tempFilePaths.length;
        if (imgLength > 0) {

          for (var i = 0; i < imgLength; i++) {
            var tempFilePath = [tempFilePaths[0]];
            var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
            if (extension) {
              extension = extension[1].toLowerCase();
            }

            var name = currentUser.id + "." + extension;//上传的图片的别名      

            var file = new Bmob.File(name, tempFilePath);
            file.save().then(function (res) {
              var url = res.url();

              urlArr3.push({ "url": url });
              that.setData({
                loading: true,
                urlArr3: urlArr3,
                statusIndex3: 0,
              })

            }, function (error) {
              console.log(error)
            });

          }
        }
      }
    })
  }
})