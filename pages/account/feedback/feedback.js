var Bmob = require('../../../utils/bmob.js');
var common = require('../../../utils/common.js');
var app = getApp();
var user;
//当前用户
            
Page({
    data: {
        userInfo: {},
        txtCount: 0
    },
    onLoad: function () {
        var that = this
        //调用应用实例的方法获取全局数据
        app.getUserInfo(function (userInfo) {
            user = Bmob.User.current();
            console.log(user)
            //更新数据
            that.setData({
                userInfo: userInfo
            })
        })

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
            if (user) {
                
            }
            //增加日记
            var Feedback = Bmob.Object.extend("Feedback");
            var fbk = new Feedback();
            fbk.set("contact", contact);
            fbk.set("content", content);
            fbk.set("userid", user.id);
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
        }

    },

})