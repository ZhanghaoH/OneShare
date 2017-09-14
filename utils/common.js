function showTip(sms, icon, fun, t) {
    if (!t) {
        t = 1500;
    }
    wx.showToast({
        title: sms,
        icon: icon,
        duration: t,
        success: fun
    })
}

function showModal(c,t,fun) {
    if(!t)
        t='提示'
    wx.showModal({
        title: t,
        content: c,
        showCancel:false,
        success: fun
    })
}

function showAbout(c,t,fun) {
    if(!t)
        t='关于爱问'
    wx.showModal({
        title: t,
        content: c,
        showCancel:false,
        success: fun
    })
}

module.exports.showTip = showTip;
module.exports.showModal = showModal;
module.exports.showAbout = showAbout;