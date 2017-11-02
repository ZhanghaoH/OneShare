const Bmob = require('../../../utils/bmob.js');
const common = require('../../../utils/common.js');
const dboperation = require('../../../utils/DBOperation.js');
const app = getApp();
var that;
//当前用户
            
Page({
    data: {
        userInfo: {},
        txtCount: 0
    },
    onLoad: function () {
      that = this;
      if (Bmob.User.current()) {
        let cuserid = Bmob.User.current().id;
        dboperation.getUser(cuserid).then(res => {
          let username = res.username;
          console.log(res)
          that.setData({
            user: res,
            avatarUrl: res.userPic,
            nickName: username,
            qualify: res.verified,
            userId: cuserid,
            formIds: res.formIds
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
    updateInfo: function (e) {
      that = this;
      var info = e.detail.value;
      var formId = e.detail.formId
      var txt_tips = "修改";
      info.title = that.data.degree[info.title];
      if (that.valid(info)) {
        for (let key in info) {
          if (cudata[key] == info[key]) {
            delete info[key];
          }
        };
        if (JSON.stringify(info) != "{}") {
          that.data.formIds.push(formId)
          info.formIds = that.data.formIds
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
            } else {
              that.onLoad();
            };
          }, (err) => { common.showModal(txt_tips + "失败，请重新尝试：" + err.message); })
        } else {
          that.setData({
            popText: "未做任何修改，不作修改点左上角返回"
          });
          that.popWarn();
        }
      }
    },
    txtcounts: function (event){
      var that = this;
      that.setData({
        txtCount: event.detail.value.length,
      });
    },
    addFeedback: function (event) {
        var that = this;
        var contact = event.detail.value.contact;
        var content = event.detail.value.content;
        var formId = event.detail.formId
        that.data.formIds.push(formId)
        var txtCount = content.length;
        if (!contact) {
            common.showModal("联系方式不能为空");
            return false;
        }
        else if (!content) {
            common.showModal("建议内容不能为空");
            return false;
        }
        else {
            that.setData({
                loading: true,
                txtCount: txtCount
            });
            //添加反馈
            var Feedback = Bmob.Object.extend("Feedback");
            var fbk = new Feedback();
            fbk.set("contact", contact);
            fbk.set("content", content);
            fbk.set("userid", that.data.userId);
            //添加数据，第一个入口参数是null
            fbk.save(null, {
                success: function (result) {
                    // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
                    that.setData({
                        loading: false
                    })
                    common.showTip('提交反馈成功','success');
                },
                error: function (result, error) {
                    // 添加失败
                    common.showModal('反馈失败，请重新发布');
                }
            });
            dboperation.changeUser(that.data.userId, {"formIds": that.data.formIds}).then(() => {
              common.showTip('反馈成功', 'success');
            }, (err) => { common.showModal(txt_tips + "失败，请重新尝试：" + err.message); })
        }

    },

})