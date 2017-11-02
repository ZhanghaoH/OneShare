//获取应用实例
const app = getApp()
const Bmob = require("../../utils/bmob.js");
const common = require('../../utils/common.js');
const util = require("../../utils/util.js");
const dboperation = require('../../utils/DBOperation.js');
const pay = require('../../utils/pay.js');
var that, tempQ, urlArr, tempUrlArr, tempQId;
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
          toformIds: resData.formIds,
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

    dboperation.getUser(userId).then((resData) => {
      console.log(resData);
      that.setData({
        formIds: resData.formIds
      });
    });
    // dboperation.getUser(that.data.callerId).then((resData) => {
    //   console.log(resData);
    //   // var resData = resData.attributes;
    //   that.setData({
    //     userData: resData.userData
    //   });
    // });
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
      dboperation.changeUser(that.data.user_id, { "formIds": that.data.formIds.push(formId) }).then(() => {
        console.log('反馈成功', 'success');
      }, (err) => { console.log("失败，请重新尝试：" + err.message); })
      that.data.isAddition ? that.changeQuestion(formId) : that.createQuestion(formId)
    }
  },
  changeQuestion: function () {
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
    } else {
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
    }

  },
  // 生成新问题
  createQuestion: function (formId) {
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
                              tempQId = result.id
                              that.inform(formId);
                              wx.switchTab({
                                url: '../discover/discover',
                              });

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
              } else {
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
                        tempQId = result.id
                        that.inform(formId);
                        wx.switchTab({
                          url: '../discover/discover',
                        });

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
    console.log(that.data.userData.openid)
    var temp = {
      "touser": that.data.userData.openid,
      "template_id": "9MnPiYpJoNVTZSFjiT1UqZWL8Wg2PfsY3M4GelhkOps",
      "page": "pages/view/view?questionId=" + tempQId,
      "form_id": that.data.toformIds[0],
      "data": {
        "keyword1": {
          "value": wx.getStorageSync('my_username')
        },
        "keyword2": {
          "value": that.data.ques,
          "color": "#666666"
        },
        "keyword3": {
          "value": "提问"
        },
        "keyword4": {
          "value": util.formatTime(new Date())
        },
      },
      "emphasis_keyword": ""
    }
    that.data.formIds.shift()
    dboperation.changeUser(that.data.userId, { "formIds": that.data.toformIds }).then(() => {
      Bmob.sendMessage(temp).then(function (obj) {
        console.log('发送成功')
      }, function (err) {
        common.showTip('失败' + JSON.stringify(err));
      });
    }, (err) => { common.showModal(txt_tips + "失败，请重新尝试：" + err.message); })
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
