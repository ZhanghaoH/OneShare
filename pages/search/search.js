//index.js
//获取应用实例
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var app = getApp();
var currentUser = Bmob.User.current();
var User = Bmob.Object.extend("_User");
var Major = Bmob.Object.extend("majors");
var University = Bmob.Object.extend("universities");
var that;
Page({
  data: {
    area: [],
    inputValue: "",
    areaIndex: "0",
    university: [],
    universityIndex: "0",
    subject: [],
    subjectIndex: "0",
    major: [],
    majorIndex: "0",
    writeDiary: false,
    windowHeight: 0,
    windowWidth: 0,
    limit: 1000,
    userList: [],
    notSearched: false,
    currentUser: currentUser,
    items: [
      { name: 'title', value: '学历', checked: 'true' },
      { name: 'university', value: '学校' },
      { name: 'major', value: '专业' },
      // { name: 'username', value: '用户名' },
      { name: 'area', value: '地区'},
    ]
  },
  onShareAppMessage: function () {
    return {
      title: '壹元知享',
      desc: '壹元知享，是一个以分享教育信息和学术知识为核心的知识共享平台',
      path: '/pages/discover/discover'
    }
  },
  /*
* 获取数据
*/
  // function getList(t, k){
  //   that = t;
  //   var Diary = Bmob.Object.extend("diary");
  //   var query = new Bmob.Query(Diary);

  //   //会员模糊查询
  //   if(k) {
  //     query.equalTo("title", { "$regex": "" + k + ".*" });
  //   }

  //    //普通会员匹配查询
  //   // query.equalTo("title", k);


  //   query.descending('createdAt');
  //   query.include("own")
  //   // 查询所有数据
  //   query.limit(that.data.limit);
  //   query.find({
  //     success: function (results) {
  //       // 循环处理查询到的数据
  //       console.log(results);
  //       that.setData({
  //         diaryList: results
  //       })
  //     },
  //     error: function (error) {
  //       console.log("查询失败: " + error.code + " " + error.message);
  //     }
  //   });
  // },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);
    that.setData({
      condition: e.detail.value
    });
    if (that.data.inputValue != "") {
      that.search();
    }
  },
  search: function () {
    that = this;
    that.setData({
    });
    var query = new Bmob.Query(User);
    query.limit(that.data.limit);
    query.equalTo(that.data.condition, { "$regex": "" + that.data.inputValue + ".*" });
    // query.equalTo(that.data.condition, that.data.inputValue);
    query.find({
      success: function (results) {
        if (results.length == 0) {
          that.setData({
            notSearched: true,
            userList: results,
          })
        }
        else {
          that.setData({
            userList: results,
            notSearched: false,
          })
        }
        wx.hideToast();
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
        wx.hideToast();
        common.showModal(error.message);
        that.setData({
        })
      }
    })
  },
  pullUpLoad: function (e) {
    console.log("3");

    var limit = that.data.limit + 2
    this.setData({
      limit: limit
    })
    this.onShow()
  },
  onLoad: function () {
    that = this;
    that.setData({
      condition: "title",
    })
  },
  noneWindows: function () {
    console.log("3");

    that.setData({
      writeDiary: "",
      modifyDiarys: ""
    })
  },
  onShow: function () {
    console.log("3");
    that = this
    var query = new Bmob.Query(User);
    query.descending('like');
    // 查询所有数据
    query.limit(that.data.limit);
    query.equalTo("verified", true);
    if (that.data.areaIndex != 0) {
      query.equalTo("areaIndex", that.data.areaIndex);
    }
    if (that.data.universityIndex != 0) {
      query.equalTo("universityIndex", that.data.universityIndex);
    }
    if (that.data.subjectIndex != 0) {
      query.equalTo("subjectIndex", that.data.subjectIndex);
    }
    if (that.data.majorIndex != 0) {
      query.equalTo("majorIndex", that.data.majorIndex);
    }
    if (that.data.areaIndex + that.data.universityIndex + that.data.subjectIndex + that.data.majorIndex > 0) {
      query.find({
        success: function (results) {
          // 循环处理查询到的数据
          console.log("result = ", results);
          that.setData({
            userList: results,
            notSearched: false,
          })
        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });
    }
    else if (!that.data.notSearched) {
    }
    else {
      that.setData({
        notSearched: true,
      })
    }

    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    });
    that.search();
  },
  toAsk: function (event) {
    var dataset = event.currentTarget.dataset;
    console.log(event);
    var user = { "id": dataset.id, "pic": dataset.pic, "name": dataset.name, "university": dataset.university, "major": dataset.major, "title": dataset.title, "like": dataset.like }
    wx.navigateTo({
      url: '../ask/ask?answerer=' + dataset.id,
    })
  },

})
