//index.js
//获取应用实例
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var app = getApp();
var currentUser = Bmob.User.current();
var grids = [
   {"name":"高考板块","ico":"sms.png","url":"../sendSms/sendSms"},
   {"name":"本科生板块","ico":"pic.png","url":"../picasa/picasa"},
   {"name":"考研板块","ico":"autologin.png","url":"../sendSms/sendSms","click":"autuLogin"},
   {"name":"硕士生板块","ico":"openid.png","url":"../getOpenId/getOpenId"},
   {"name":"博士生板块","ico":"pay.png","url":"../pay/pay"},
   {"name":"其它板块","ico":"code.png","url":"code/code"},];
var that;
Page({
  data: {
    grids: grids,
    writeDiary: false,
    loading: false,
    windowHeight: 0,
    windowWidth: 0,
    limit: 10,
    diaryList: [],
    modifyDiarys: false,
    userInfo: {},
  },
  onLoad: function () {
    that = this;
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    });
  },
  noneWindows: function () {
    that.setData({
      writeDiary: "",
      modifyDiarys: ""
    })
  },
  onShow: function () {
    var Diary = Bmob.Object.extend("diary");
    var query = new Bmob.Query(Diary);
    query.descending('createdAt');
    query.include("own")
    // 查询所有数据
    query.limit(that.data.limit);
    query.find({
      success: function (results) {
        // 循环处理查询到的数据
        // console.log(results);
        that.setData({
          diaryList: results
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },
  pullUpLoad: function (e) {
    // var limit = that.data.limit + 2
    // this.setData({
    //   limit: limit
    // })
    // this.onShow()
  },
  toAsk: function () {
    wx.navigateTo({
      url: '../ask/ask',
      complete: function (res) {
        // complete
      }
    })
  },
  addDiary: function (event) {
    var title = event.detail.value.title;
    var content = event.detail.value.content;
    if (!title) {
      common.showTip("标题不能为空", "loading");
    }
    else if (!content) {
      common.showTip("内容不能为空", "loading");
    }
    else {
      that.setData({
        loading: true
      })

      var User = Bmob.Object.extend("_User");
      var UserModel = new User();
      var post = Bmob.Object.createWithoutData("_User", currentUser.id);
      console.log(currentUser);
      //增加日记
      var Diary = Bmob.Object.extend("diary");
      var diary = new Diary();
      diary.set("title", title);
      diary.set("content", content);
      diary.set("author", that.data.userInfo.nickName);
      diary.set("author", currentUser.id);
      if (currentUser) {
        UserModel.objectId = currentUser.id;
        diary.set("own", post);
      }
      //添加数据，第一个入口参数是null
      diary.save(null, {
        success: function (result) {
          // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
          // common.showTip('添加日记成功');
          that.setData({
            writeDiary: false,
            loading: false
          })
          that.onShow();
          var query = new Bmob.Query(User);
          query.equalTo("objectId", diary.authorid)
          query.find({
            success: function (results) {
              common.showTip('共查询到' + results.length + '个用户')
              // 循环处理查询到的数据
              for (var i = 0; i < results.length; i++) {
                var object = results[i];
                console.log(object.id + ' - ' + object.get('username'));
              }
            },
            error: function (error) {
              wx.showToast({
                title: '查询失败',
                icon: 'loading',
                duration: 2000,
              })
            }
          })
        },
        error: function (result, error) {
          // 添加失败
          common.showTip('添加日记失败，请重新发布', 'loading');

        }
      });
    }

  },
  closeLayer: function () {
    that.setData({
      writeDiary: false
    })
  },
  deleteDiary: function (event) {
    console.log(event.target.dataset);
    var objectId = event.target.dataset.id;
    wx.showModal({
      title: '操作提示',
      content: '确定要删除要日记？',
      success: function (res) {
        if (res.confirm) {
          //删除日记
          var Diary = Bmob.Object.extend("diary");
          //创建查询对象，入口参数是对象类的实例
          var query = new Bmob.Query(Diary);
          query.equalTo("objectId", objectId);
          query.destroyAll({
            success: function () {
              common.showTip('删除日记成功');
              that.onShow();
            },
            error: function (err) {
              common.showTip('删除日记失败', 'loading');
            }
          });
        }
      }
    })
  },
  toModifyDiary: function (event) {
    var nowTile = event.target.dataset.title;
    var nowContent = event.target.dataset.content;
    var nowId = event.target.dataset.id;
    console.log("toModifyDiary is called");
    console.log(nowId);
    that.setData({
      modifyDiarys: true,
      nowTitle: nowTile,
      nowContent: nowContent,
      nowId: nowId
    })
  },
  modifyDiary: function (e) {
    //修改日记
    var modyTitle = e.detail.value.title;
    var modyContent = e.detail.value.content;
    var objectId = e.detail.value.content;
    var thatTitle = that.data.nowTitle;
    var thatContent = that.data.nowContent;
    if ((modyTitle != thatTitle || modyContent != thatContent)) {
      if (modyTitle == "" || modyContent == "") {
        common.showTip('标题或内容不能为空', 'loading');
      }
      else {
        console.log(modyContent)
        var Diary = Bmob.Object.extend("diary");
        var query = new Bmob.Query(Diary);
        // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
        query.get(that.data.nowId, {
          success: function (result) {
            console.log(result);
            // 回调中可以取得这个 GameScore 对象的一个实例，然后就可以修改它了
            result.set('title', modyTitle);
            result.set('content', modyContent);
            result.save();
            common.showTip('日记修改成功', 'success', function () {
              that.onShow();
              that.setData({
                modifyDiarys: false
              })
            });

            // The object was retrieved successfully.
          },
          error: function (object, error) {

          }
        });
      }
    }
    else if (modyTitle == "" || modyContent == "") {
      common.showTip('标题或内容不能为空', 'loading');
    }
    else {
      that.setData({
        modifyDiarys: false
      })
      common.showTip('修改成功', 'loading');
    }
  },
  closeAddLayer: function () {
    that.setData({
      modifyDiarys: false
    })
  }

})
