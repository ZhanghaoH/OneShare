//获取应用实例
const app = getApp()
const Bmob = require("../../utils/bmob.js");
const common = require('../../utils/common.js');
const dboperation = require('../../utils/DBOperation.js');
const pay = require('../../utils/pay.js');
var that, tempQ, urlArr, tempUrlArr;
Page({
  data: {
    isPublic: true,
    label: ["请选择问答板块", "小学", "初中", "高中", "大学本科", "硕士研究生", "博士研究生", "出国留学", "考级考试", "其它"],
    labelIndex: "0",
    askerId: "",
    isAddition: false,
    ques: "",
    content: "",
    published: false,
    hidden: true,
    showTopTips: false,
    topTips: "",
    strLen: 0,
    imgArr: [],
  },
  onLoad: function (options) {
    that = this;
    urlArr = new Array()
    tempUrlArr = new Array()
    var userId = wx.getStorageSync("user_id"); //获取用户id
    // answerer存在，则是指定回答者,需要加载用户信息
    if (options.answerer) {
      let tmpUser = options.answerer;
      dboperation.getUser(tmpUser).then(resData => {
        console.log(resData);
        that.setData({
          caller: resData,
          callerId: tmpUser,
          isPublic: false,
          hidden: false,
        });
      })
    }

    // questionId存在则是修改问题，存下答案id发布问题时修改问题而非增加问题
    if (options.questionId) {
      tempQ = options.questionId;
      that.setData({
        isAddition: true
      })
      dboperation.getById("Question", tempQ).then(res => {
        console.log(res);
        let arrLabel = that.data.label
        let quesLabel = res.get("label")
        let i = arrLabel.indexOf(quesLabel)
        urlArr = res.get('images')
        that.setData({
          ques: res.get("ques"),
          content: res.get("content"),
          labelIndex: i,
          imgArr: res.get('images'),
          strLen: res.get("content").length
        })
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
  // 提问时公私问转换
  changePublic: function (e) {//switch开关
    that = this;
    console.log(e.detail.value)
    if (e.detail.value == true) {
      wx.showToast({
        title: '问答已公开',
        icon: 'success',
        duration: 1500,
        mask: true,
      })
    } else {
      wx.showToast({
        title: '问答已隐藏',
        icon: 'success',
        duration: 1500,
        mask: true,
      })
    }
    that.setData({
      isPublic: e.detail.value
    })
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
  },
  setContent: function (e) {//问题内容
    that.setData({
      content: e.detail.value,
      strLen: e.detail.value.length,
    })
  },
  setQues: function (e) {
    that.setData({
      ques: e.detail.value
    })
  },
  showTopTips: function (str) {
    var that = this;
    this.setData({
      showTopTips: true,
      topTips: str
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false,
        topTips: ""
      });
    }, 3000);
  },
  sendNewQuestion: function (e) {//发布问题
    that = this;
    var content = that.data.content;
    var ques = that.data.ques;
    var labelIndex = that.data.labelIndex;
    var formId = e.detail.formId;
    // that.inform(formId);
    if (ques == "") {
      that.showTopTips("标题不能为空");
      return;
    }
    else if (labelIndex == 0) {
      that.showTopTips("请选择问答板块");
      return;
    }
    else if (content == "") {
      that.showTopTips("问题内容不能为空");
      return;
    }
    else {
      wx.showLoading({
        title: '问题发布中...',
        mask: true,
      })
      that.data.isAddition ? that.changeQuestion() : that.createQuestion()
    }
  },
  changeQuestion() {
    console.log("change")
    let content = that.data.content;
    let ques = that.data.ques;
    let labelIndex = that.data.labelIndex;

    var newDate = new Date();
    var newDateStr = newDate.toLocaleDateString();
    var imgLength = tempUrlArr.length
    if (imgLength > 0) {

      var j = 0;
      for (var i = 0; i < imgLength; i++) {
        var tempFilePath = [tempUrlArr[i]];
        var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
        if (extension) {
          extension = extension[1].toLowerCase();
        }
        var name = newDateStr + "." + extension;//上传的图片的别名      

        var file = new Bmob.File(name, tempFilePath);
        file.save().then(function (res) {
          var url = res.url();
          console.log("第" + i + "张Url" + url);

          urlArr.push(url);
          j++;
          console.log(j, imgLength);
          if (imgLength == j) {
            console.log(imgLength, urlArr);
          }
          let data = { "ques": ques, "content": content, "label": that.data.label[that.data.labelIndex], "images": urlArr }
          let question = dboperation.change("Question", tempQ, data).then(() => {
            // let ans = dboperation.change("Answer", tempQ, data2)
            // Promise.all([ques, ans]).then(() => {
            wx.hideLoading();
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              image: '',
              duration: 1500,
              mask: true,
              success: function (res) {
                wx.switchTab({
                  url: '../discover/discover',
                });
              },
            })
          }).catch(() => {
            wx.hideLoading();
            wx.showToast({
              title: '补充问题失败失败',
              icon: 'success',
              image: '',
              duration: 1500,
              mask: true,
            })
          })

        }, function (error) {
          console.log(error)
        });
      }
    }

  },
  // 生成新问题
  createQuestion: function () {
    console.log("create")
    let content = that.data.content;
    let ques = that.data.ques;
    let labelIndex = that.data.labelIndex;
    wx.getStorage({
      key: 'user_openid',
      success: function (res) {
        pay.pay(0.01, '问题支付', '您将为发布问题支付相应费用', res.data).then(() => {
          wx.getStorage({
            key: 'user_id',
            success: function (ress) {
              var Question = Bmob.Object.extend("Question");
              var question = new Question();
              var query = new Bmob.Query(Bmob.User);
              var publisherPic = '';
              var publisherName = '';

              var newDate = new Date();
              var newDateStr = newDate.toLocaleDateString();
              var imgLength = tempUrlArr.length
              if (imgLength > 0) {

                var j = 0;
                for (var i = 0; i < imgLength; i++) {
                  var tempFilePath = [tempUrlArr[i]];
                  var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
                  if (extension) {
                    extension = extension[1].toLowerCase();
                  }
                  var name = newDateStr + "." + extension;//上传的图片的别名      

                  var file = new Bmob.File(name, tempFilePath);
                  file.save().then(function (res) {
                    var url = res.url();
                    console.log("第" + i + "张Url" + url);

                    urlArr.push(url);
                    j++;
                    console.log(j, imgLength);
                    if (imgLength == j) {
                      console.log(imgLength, urlArr);
                      query.get(ress.data, {
                        success: function (result) {
                          publisherPic = result.get("userPic");
                          publisherName = result.get("username");
                          question.set("ques", ques);
                          question.set("content", content);
                          question.set("isPublic", that.data.isPublic);
                          question.set("caller", that.data.callerId);
                          question.set("publisher", publisherName);
                          question.set("publisherPic", publisherPic);
                          question.set("label", that.data.label[that.data.labelIndex]);
                          question.set("answerNum", 0);
                          question.set("publisherId", ress.data);
                          question.set("answers", []);
                          question.set("images", urlArr);
                          console.log(question);
                          question.save(null, {
                            success: function (result) {
                              wx.hideLoading();
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
                      //   //如果担心网络延时问题，可以去掉这几行注释，就是全部上传完成后显示。
                      //   showPic(urlArr, that)
                    }

                  }, function (error) {
                    console.log(error)
                  });
                }
              }


            }
          })
        }).catch(() => {
          wx.showToast({
            title: '付款失败',
            icon: 'success',
            image: '',
            duration: 1500,
            mask: true,
          })
        })
      },
    })
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
  },
  delImg: function () {//图片删除
    var path;
    //删除第一张
    path = this.data.tempUrlArr[0].url;
    var s = new Bmob.Files.del(path).then(function (res) {
      if (res.msg == "ok") {
        console.log('删除成功');
        common.showModal("删除成功");
      }
      console.log(res);
    }, function (error) {
      console.log(error)
    }
    );
  },
  upImg: function () {
    var that = this;
    var count = tempUrlArr.length
    wx.chooseImage({
      count: 9 - count, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths)
        var imgLength = tempFilePaths.length;
        if (imgLength > 0) {
          tempUrlArr = tempUrlArr.concat(tempFilePaths);
          showPic(urlArr.concat(tempUrlArr), that)
        }
      }
    })
    //上传完成后显示图片
    function showPic(tempUrlArr, t) {
      t.setData({
        imgArr: tempUrlArr
      })
    }
  },
  showMenu: function (e) {
    var index = e.currentTarget.dataset.index
    wx.showActionSheet({
      itemList: ['删除', '预览'],
      success: function (res) {
        console.log(res.tapIndex)
        switch (res.tapIndex) {
          case 0:
            tempUrlArr.splice(index, 1)
            that.setData({
              imgArr: tempUrlArr
            })
            break
          case 1:
            wx.previewImage({
              urls: tempUrlArr,
              current: tempUrlArr[index]
            })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  }
})
