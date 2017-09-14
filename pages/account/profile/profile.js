//index.js
//获取应用实例
var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/common.js');
 
var app = getApp();
var that;
var currentUser;
Page({
  data: {
    windowHeight: 0,
    windowWidth: 0,
    limit: 10,
    degree: ["初中", "高中", "本科", "硕士", "博士", "其它"],
    titleIndex: '0',
    userName: '名字',
    phoneNum: '手机号码',
    email: '电子邮箱',
    area: '所在地区',
    university: '大学',
    major: '专业',

    editName: false,
    editPhoneNum: false,
    editEmail: false,
    editMajor: false,
    editArea: false,
    editUniversity: false,
  },
  onLoad: function () {
    that = this;
    currentUser = Bmob.User.current();
    var userId = currentUser.id;
    console.log(currentUser.id);

    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        userId: userId
      })
    });

    var query = new Bmob.Query(Bmob.User);
    query.equalTo("objectId", userId);
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

  },
  onShareAppMessage: function () {
    return {
      title: '壹元知享',
      desc: '壹元知享，是一个以分享教育信息和学术知识为核心的知识共享平台',
      path: '/pages/discover/discover'
    }
  },
  noneWindows: function () {
    this.setData({
      editName: false,
      editPhoneNum: false,
      editEmail: false,
      editMajor: false,
      editArea: false,
      editUniversity: false,
    })
  },
  onShow: function () {
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })

  },
  aboutUpdate: function (obj) {
    console.log(obj)
    var a = dboperation.getBy("Answers", "publisherId", that.data.userId);
    var q = dboperation.getBy("Question", "publisherId", that.data.userId);
    Promise.all([a, q]).then(resData => {
      console.log(resData);
      resData[0].map(e => {
        dboperation.change("Answers", e.id, obj).then(() => { console.log("更新成功") },() => { console.log("更新shibai") });
      });
      resData[1].map(e => {
        dboperation.change("Question", e.id, obj).then(() => { console.log("更新成功") },() => { console.log("更新shibai") });
      });
    });
  },
  toEditName: function (e) {
    this.setData({
      editName: true,
    })
  },
  toEditMajor: function (e) {
    this.setData({
      editMajor: true,
    })
  },
  toEditArea: function (e) {
    this.setData({
      editArea: true,
    })
  },
  toEditUniversity: function (e) {
    this.setData({
      editUniversity: true,
    })
  },
  modifyMajor: function (e) {
    that = this;
    var mody = e.detail.value;
    console.log(e);
    var origin = that.data.major;
    if (mody.major != origin) {
      ;
      dboperation.change("_User", that.data.userId, mody).then(() => {
        that.setData({
          major: mody.major,
          editMajor: false,
        });
        that.aboutUpdate(mody);
        common.showTip('修改成功', 'success', function () {
          that.onShow();
        });
      }, () => { common.showModal("修改失败，请重新尝试"); })
    }
  },
  modifyName: function (e) {
    var mody = e.detail.value.title;
    var origin = that.data.userName;
    if (mody != origin) {
      if (mody == "") {
        common.showModal("内容不能为空");
      }
      else {
        currentUser.set("username", mody);
        currentUser.save(null, {
          success: function (result) {
            that.setData({
              userName: mody,
            });
            that.aboutUpdate({ "publisher": mody });
            common.showTip('修改成功', 'success', function () {
              that.onShow();
              that.setData({
                editName: false,
              })
            });
          },
          error: function (result, error) {
            common.showModal("格式错误，请重新尝试");
          }
        });
      }
    }
    else if (mody == "") {
      common.showModal("内容不能为空");
    }
    else {
      that.setData({
        editName: false
      })
      common.showTip('修改成功', 'success', function () {
        that.setData({
          editName: false,
        })
      });
    }
  },
  toEditPhoneNum: function (e) {
    this.setData({
      editPhoneNum: true,
    })
  },
  modifyPhoneNum: function (e) {
    var mody = e.detail.value.title;
    var origin = that.data.phoneNum;
    if (mody != origin) {
      if (mody == "") {
        common.showModal("内容不能为空");
      }
      else if (mody.length != 11) {
        common.showModal("请输入11位手机号");
      }
      else {
        currentUser.set("mobilePhoneNumber", mody);
        currentUser.save(null, {
          success: function (result) {
            that.setData({
              phoneNum: mody,
            })
            common.showTip('修改成功', 'success', function () {
              that.onShow();
              that.setData({
                editPhoneNum: false,
              })
            });
          },
          error: function (result, error) {
            common.showModal("格式错误，请重新尝试");
            that.setData({
              editPhoneNum: false,
            })
          }
        });
      }
    }
    else if (mody == "") {
      common.showModal("内容不能为空");
    }
    else {
      that.setData({
        editPhoneNum: false
      })
      common.showTip('修改成功', 'success', function () {
        that.setData({
          editPhoneNum: false,
        })
      });
    }
  },
  toEditEmail: function (e) {
    this.setData({
      editEmail: true,
    })
  },
  modifyEmail: function (e) {
    var mody = e.detail.value.title;
    var origin = that.data.email;
    if (mody != origin) {
      if (mody == "") {
        common.showModal("内容不能为空");
      }
      else {
        currentUser.set("email", mody);
        currentUser.save(null, {
          success: function (result) {
            that.setData({
              email: mody,
            })
            common.showTip('修改成功！', 'success', function () {
              that.onShow();
              that.setData({
                editEmail: false,
              })
            });
          },
          error: function (result, error) {
            common.showModal("格式错误，请重新尝试");
            that.setData({
              editEmail: false,
            })
          }
        });
      }
    }
    else if (mody == "") {
      common.showModal("内容不能为空");
    }
    else {
      that.setData({
        editEmail: false
      })
      common.showTip('修改成功', 'success', function () {
        that.setData({
          editEmail: false,
        })
      });
    }
  },
  modifyArea: function (e) {
    var mody = e.detail.value.title;
    var origin = that.data.area;
    if (mody != origin) {
      if (mody == "") {
        common.showModal("内容不能为空");
      }
      else {
        currentUser.set("area", mody);
        currentUser.save(null, {
          success: function (result) {
            that.setData({
              area: mody,
            })
            common.showTip('修改成功！', 'success', function () {
              that.onShow();
              that.setData({
                editArea: false,
              })
            });
          },
          error: function (result, error) {
            common.showModal("格式错误，请重新尝试");
            that.setData({
              editArea: false,
            })
          }
        });
      }
    }
    else if (mody == "") {
      common.showModal("内容不能为空");
    }
    else {
      that.setData({
        editArea: false
      })
      common.showTip('修改成功', 'success', function () {
        that.setData({
          editArea: false,
        })
      });
    }
  },
  modifyUniversity: function (e) {
    var mody = e.detail.value.title;
    var origin = that.data.University;
    if (mody != origin) {
      if (mody == "") {
        common.showModal("内容不能为空");
      }
      else {
        currentUser.set("university", mody);
        currentUser.save(null, {
          success: function (result) {
            that.setData({
              university: mody,
            })
            // that.aboutUpdate({ "university": mody });
            common.showTip('修改成功！', 'success', function () {
              that.onShow();
              that.setData({
                editUniversity: false,
              })
            });
          },
          error: function (result, error) {
            common.showModal("格式错误，请重新尝试");
            that.setData({
              editUniversity: false,
            })
          }
        });
      }
    }
    else if (mody == "") {
      common.showModal("内容不能为空");
    }
    else {
      that.setData({
        editUniversity: false
      })
      common.showTip('修改成功', 'success', function () {
        that.setData({
          editUniversity: false,
        })
      });
    }
  },
  onAreaChange: function (e) {
    that = this;
    var mody = e.detail.value;
    var origin = this.data.areaIndex;
    if (mody == 0) {
      common.showModal("请选择地区");
    }
    else {
      currentUser.set("area", that.data.area[mody]);
      console.log("currentUser", currentUser)
      currentUser.save(null, {
        success: function (result) {
          var University = Bmob.Object.extend("universities");
          var query = new Bmob.Query(University);
          that.setData({
            myArea: that.data.area[mody],
          })
          query.equalTo("area", that.data.area[mody]);
          query.first({
            success: function (result) {
              // 循环处理查询到的数据
              var tmpUniversity = result.get("list");
              that.setData({
                university: tmpUniversity,
                universityIndex: "0",
                myUniversity: tmpUniversity[0]
              })
            },
            error: function (error) {
              console.log("查询失败: " + error.code + " " + error.message);
            }
          });
          that.setData({
            areaIndex: mody,
          })
          common.showTip('修改成功', 'success', function () {
            that.onShow();
          });
        },
        error: function (result, error) {
          common.showModal("修改失败，请重新尝试");
        }
      });
    }
  },
  onUniversityChange: function (e) {
    that = this;
    var mody = e.detail.value;
    var origin = this.data.universityIndex;
    if (this.data.areaIndex != 0) {
      if (mody != origin) {
        if (mody == 0) {
          common.showModal("请选择学校");
        }
        else {
          currentUser.set("university", that.data.university[mody]);
          currentUser.save(null, {
            success: function (result) {
              that.setData({
                universityIndex: mody,
                myUniversity: that.data.university[mody]
              })
              common.showTip('修改成功', 'success', function () {
                that.onShow();
              });
            },
            error: function (result, error) {
              common.showModal("修改失败，请重新尝试");
            }
          });
        }
      }
      else {
        common.showTip('修改成功', 'success');
      }
    }
  },
  onTitleChange: function (e) {
    that = this;
    var mody = e.detail.value;
    console.log(mody);
    var origin = that.data.titleIndex;
    if (mody != origin) {
      // var query = new Bmob.Query(Bmob.User);
      // // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
      // query.get(that.data.userId, {
      //   success: function (result) {
      //     // 自动绑定之前的账号

      //     result.set("title",that.data.degree[mody]);
      //     console.log(result);
      //     result.save();

      //   }
      // });
      dboperation.change("_User", that.data.userId, { "title": that.data.degree[mody] }).then(() => {
        that.setData({
          titleIndex: mody,
        })
        that.aboutUpdate({ "label": that.data.degree[mody] });
        common.showTip('修改成功', 'success', function () {
          that.onShow();
        });
      }, () => { common.showModal("修改失败，请重新尝试"); })
    }
  },
  // onMajorChange: function (e) {
  //   that = this;
  //   var mody = e.detail.value;
  //   var origin = this.data.majorIndex;
  //   if (this.data.subjectIndex != 0) {
  //     if (mody != origin) {
  //       if (mody == 0) {
  //         common.showModal("请选择专业");
  //       }
  //       else {
  //         currentUser.set("majorIndex", mody);
  //         currentUser.set("major", that.data.major[mody]);
  //         currentUser.save(null, {
  //           success: function (result) {
  //             that.setData({
  //               majorIndex: mody,
  //               myMajor: that.data.major[mody]
  //             })
  //             common.showTip('修改成功', 'success', function () {
  //               that.onShow();
  //             });
  //           },
  //           error: function (result, error) {
  //             common.showModal("修改失败，请重新尝试");
  //           }
  //         });
  //       }
  //     }
  //     else {
  //       common.showTip('修改成功', 'success');
  //     }
  //   }
  // }
})