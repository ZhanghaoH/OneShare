var Bmob = require('./bmob.js');
function pay(total, title, desc, openId) {
  return new Promise((resolve, reject) => {
    //传参数金额，名称，描述,openid
    Bmob.Pay.wechatPay(total, title, desc, openId).then(function (resp) {
      console.log('resp', resp);
      resolve()
      //发起支付
      // wx.requestPayment({
      //   'timeStamp': timeStamp,
      //   'nonceStr': nonceStr,
      //   'package': packages,
      //   'signType': 'MD5',
      //   'paySign': sign,
      //   'success': function (res) {
      //     //付款成功,这里可以写你的业务代码
      //     console.log(res);
      //     resolve(res);
      //   },
      //   'fail': function (res) {
      //     //付款失败
      //     console.log('付款失败');
      //     reject(res)
      //     console.log(res);
      //   }
      // })

    }, function (err) {
      console.log('服务端返回失败');
      wx.showModal({
        title: '提示',
        content: err.message,
      })
      reject(err);
      console.log(err);
    });
  })
}
module.exports.pay = pay;