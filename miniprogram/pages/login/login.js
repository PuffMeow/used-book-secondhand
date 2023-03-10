const db = wx.cloud.database();
const app = getApp();
Page({

      /**
       * 页面的初始数据
       */
      data: {
            wxAccount: '',
            schoolId: '',
            checked: false,
            type: ""
      },

      onLoad(e) {
            if (e.type === 'edit') {
                  this.data.type = 'edit'
            }
      },

      choose(e) {
            let that = this;
            that.setData({
                  ids: e.detail.value
            })
      },
      handleWxAccountInput(e) {
            this.data.wxAccount = e.detail.value;
      },
      handleSchoolIdInput(e) {
            this.data.schoolId = e.detail.value;
      },
      getUserInfo(e) {
            console.log(e)
            let test = e.detail.errMsg.indexOf("ok");
            if (test == '-1') {
                  wx.showToast({
                        title: '请授权后方可使用',
                        icon: 'none',
                        duration: 2000
                  });
            } else {
                  this.setData({
                        userInfo: e.detail.userInfo
                  })
                  this.check();
            }

      },
      //校检
      check() {
            const _this = this;
            const {
                  schoolId,
                  wxAccount
            } = _this.data
            if (schoolId === '' || schoolId.length < 10) {
                  wx.showToast({
                        title: '请输入正确的学号',
                        icon: 'none',
                        duration: 2000
                  });
                  return false
            }
            if (wxAccount === '') {
                  wx.showToast({
                        title: '请输入微信号',
                        icon: 'none',
                        duration: 2000
                  });
                  return false;
            }

            wx.showLoading({
                  title: '正在提交',
            })
            db.collection('user').add({
                  data: {
                        schoolId: _this.data.schoolId,
                        wxAccount: _this.data.wxAccount,
                        stamp: new Date().getTime(),
                        userInfo: _this.data.userInfo,
                        useful: true,
                        parse: 0,
                  },
                  success: (res) => {
                        db.collection('user').doc(res._id).get({
                              success: res => {
                                    app.userinfo = res.data;
                                    app.openid = res.data._openid;

                                    wx.showToast({
                                          title: '注册成功',
                                          icon: 'success',
                                    })

                                    setTimeout(() => {
                                          wx.switchTab({
                                                url: '/pages/index/index',
                                          })
                                    }, 1500);
                              },
                              fail: (e) => {
                                    console.log(e)
                                    wx.showToast({
                                          title: '注册失败，请重新提交',
                                          icon: 'none',
                                    })
                                    wx.hideLoading();
                              }
                        })
                  },
                  fail() {
                        wx.hideLoading();
                        wx.showToast({
                              title: '注册失败，请重新提交',
                              icon: 'none',
                        })
                  }
            })
      },

})