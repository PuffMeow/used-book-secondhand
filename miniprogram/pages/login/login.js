const db = wx.cloud.database();
const app = getApp();

Page({
      /**
       * 页面的初始数据
       */
      data: {
            // wxAccount: '',
            schoolId: '',
            phone: "",
            checked: false,
            type: ""
      },

      onLoad: async function (e) {
            if (e.type === 'edit') {
                  this.setData({
                        type: 'edit',
                  })

                  const res = await db.collection('user').where({
                        _openid: app.openid
                  }).get()
                  const {
                        schoolId,
                        // wxAccount,
                        phone
                  } = res.data[0]


                  this.setData({
                        // wxAccount,
                        schoolId,
                        phone
                  })
            }
      },

      goback() {
            wx.navigateBack()
      },

      choose(e) {
            let that = this;
            that.setData({
                  ids: e.detail.value
            })
      },
      // handleWxAccountInput(e) {
      //       this.setData({
      //             wxAccount: e.detail.value
      //       })
      // },
      handleSchoolIdInput(e) {
            this.setData({
                  schoolId: e.detail.value
            })
      },
      handlePhoneInput(e) {
            this.setData({
                  phone: e.detail.value
            })
      },
      getUserInfo: async function (e) {
            if (!this.isValidData()) {
                  return
            }
            if (this.data.type === 'edit') {
                  try {
                        await db.collection('user').where({
                              _openid: app.openid
                        }).update({
                              data: {
                                    // wxAccount: this.data.wxAccount,
                                    schoolId: this.data.schoolId,
                                    phone: this.data.phone
                              }
                        })

                        wx.showToast({
                              title: '修改成功',
                        })

                  } catch (e) {
                        wx.showToast({
                              title: '修改失败，请重试',
                              icon: "none"
                        })
                  }
            } else {
                  let test = e.detail.errMsg.indexOf("ok");
                  if (test == '-1') {
                        wx.showToast({
                              title: '请授权后方可使用',
                              icon: 'none',
                              duration: 2000
                        });
                  } else {
                        this.data.userInfo = e.detail.userInfo
                        this.register();
                  }
            }


      },
      isValidData() {
            const _this = this;
            const {
                  schoolId,
                  // wxAccount,
                  phone
            } = _this.data
            if (schoolId === '' || schoolId.length < 10) {
                  wx.showToast({
                        title: '请输入正确的学号',
                        icon: 'none',
                        duration: 2000
                  });
                  return false
            }
            // if (wxAccount === '' || !/^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$/.test(wxAccount)) {
            //       wx.showToast({
            //             title: '请输入正确的微信号',
            //             icon: 'none',
            //             duration: 2000
            //       });
            //       return false;
            // }
            if (phone === '' || !/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(phone)) {
                  wx.showToast({
                        title: '请输入正确的手机号',
                        icon: 'none',
                        duration: 2000
                  });
                  return false;
            }
            return true
      },

      register: async function () {
            const _this = this;
            wx.showLoading({
                  title: '正在提交',
            })

            const exsitedData = await db.collection('user').where({
                  phone: this.data.phone,
                  schoolId: this.data.schoolId
            }).get()


            if (exsitedData.data.length) {
                  const userInfo = exsitedData.data[0]
                  app.userinfo = userInfo.userInfo;
                  app.openid = userInfo._openid;

                  wx.showToast({
                        title: '登录成功',
                        icon: 'success',
                  })

                  wx.setStorageSync('openid', userInfo._openid)
                  wx.setStorageSync('userInfo', userInfo.userInfo)
                  setTimeout(() => {
                        wx.switchTab({
                              url: '/pages/index/index',
                        })
                  }, 1500);
                  return
            }
            db.collection('user').add({
                  data: {
                        schoolId: _this.data.schoolId,
                        // wxAccount: _this.data.wxAccount,
                        phone: _this.data.phone,
                        stamp: new Date().getTime(),
                        userInfo: _this.data.userInfo,
                        useful: true,
                        parse: 0,
                  },
                  success: (res) => {
                        db.collection('user').doc(res._id).get({
                              success: res => {
                                    app.userinfo = res.data.userInfo;
                                    app.openid = res.data._openid;

                                    wx.showToast({
                                          title: '注册成功',
                                          icon: 'success',
                                    })

                                    wx.setStorageSync('openid', res.data._openid)
                                    wx.setStorageSync('userInfo', res.data.userInfo)

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