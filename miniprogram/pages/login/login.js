const app = getApp();
const accountInfo = wx.getAccountInfoSync();
const db = wx.cloud.database();
const defaultAvatarUrl = 'https://677a-gzzw-1g7ti6il9d8c706e-1319528067.tcb.qcloud.la/img/0.png?sign=8f3ffd3db9979fbdbd8f16de6123b023&t=1689832491'
let _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    is_agree: false,
    laws: '1.开发者收集的信息，开发者收集你的用户信息（微信昵称、头像、性别、地区），用于让用户更好的填写报修，可以一键导入。2.开发者对信息的存储 2.1 储存地点：境内 2.2 储存期限：小程序停止运营后及时删除。3.信息的使用规则 3.1 开发者将会在本指引所涵盖的用途内使用收集的信息。3.2 如开发者使用你的信息超出本指引目的或合理范围，会及时更新本指引，同 时，开发者在使用你的信息前，再次告知并征得你的明示同意。4.信息对外提供 4.1 开发者承诺，不会主动共享或转让你的信息至任何第三方，如存在确需共享或转让时，开发者应当直接或确认第三方征得你的明示同意。4.2 开发者承诺，不会对外公开披露你的信息，如必须公开披露时，开发者应当向你告知公开披露的目的、披露信息的类型及可能涉及的信息，并征得你的明示同意。4.3 若你认为开发者未遵守上述约定，或有其他的投诉建议、未成年人个人信息相关问题，请与开发者联系；或者向微信 进行投诉。',
    show_phone: true,
    userInfo: null,
    avatarUrl: defaultAvatarUrl,
  },
  agree() {
    this.setData({
      is_agree: !this.data.is_agree
    })
  },
  showLaw() {
    wx.showModal({
      title: '隐私策略',
      content: this.data.laws
    })
  },
  getPhoneNumber(e) {
	  
	  if(this.data.is_agree == false){
		  wx.showToast({
		    title: '请先阅读并同意用户条款和隐私条例',
		    icon: 'none'
		  })
	  }else{  wx.showLoading({
      title: '获取中'
    })
    console.log("获取微信手机号", e);
    wx.cloud.callFunction({
      name: 'getPhoneNumber',
      data: {
        cloudID: e.detail.cloudID
      }
    }).then(res => {
      console.log('获取成功：', res)
      wx.showToast({
        title: '获取成功',
      })
      wx.setStorageSync('phone', res.result.list[0].data.phoneNumber);
      this.setData({
        phone: res.result.list[0].data.phoneNumber,
        show_phone: false,
      })
    })
	}
  },

  // ddinput(e) {
  //   let name = e.currentTarget.dataset.name
  //   this.data[name] = e.detail.value
  //   this.setData({
  //     phone: this.data.phone,
  //     dphone: this.data.dphone
  //   })
  // },


  onLoad: function (options) {
    _this = this
  },


  backToindex() {
wx.exitMiniProgram({success: (res) => {}})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
    let openid = wx.getStorageSync('openid');

    wx.cloud.uploadFile({
      cloudPath: 'userlogo/'+openid+".png", // 上传至云端的路径
      filePath: e.detail.avatarUrl, // 小程序临时文件路径
      success: res => {
        // 返回文件 ID
        wx.setStorageSync('logo', res.fileID)
      },
      fail: console.error
    })
    this.authorLogin()
  },
  /**
   * 2022年11月08日废弃接口
   */
  // getUserProfile(e) {
  //   console.log(e)
  //   wx.getUserProfile({
  //     desc: '用于完善用户资料(头像、昵称等)',
  //     lang: 'zh_CN',
  //     success: (res) => {
  //       console.log('获取用户信息成功', res)
  //       this.setData({
  //         getuser: res.userInfo
  //       })
  //       this.authorLogin()
  //     },
  //     fail: (res) => {
  //       console.log('获取用户信息失败', res)
  //     }
  //   })

  // },
  /**
   * 授权后
   */
  authorLogin() {
    if (this.data.is_agree == false) {
      wx.showToast({
        title: '请先阅读并同意用户条款和隐私条例',
        icon: 'none'
      })
    } else if (this.data.phone == '') {
      wx.showToast({
        title: '请授权获取您的手机号',
        icon: 'none'
      })
    } else {
      wx.redirectTo({
        url: '/pages/mine/info/info',
      })
      // let userInfo = this.data.getuser
      // userInfo.id = wx.getStorageSync("user").id
      // userInfo.phone = this.data.phone
      // userInfo.dphone = this.data.dphone
      // console.log(userInfo,"获取到用户个人信息")
      // if(userInfo.nickName != "微信用户" && userInfo.nickName != ""){
      //   wx.setStorageSync('userInfo', userInfo);
      //   wx.redirectTo({
      //     url: '/pages/mine/info/info',
      //   })
      // }
     
      // wx.showLoading({
      //   title: '授权中',
      //   task: true
      // })
      // wx.showToast({
      //   title: '授权成功',
      //   mask: true,
      //   duration: 800
      // })
      // let user = res.data
      // user.phone = _this.data.phone
      // wx.setStorageSync("user", user)
      
      // app.com.post('wx/user/update', userInfo, function (res) {
      //   wx.hideLoading()
      //   if(res.code == 1){

      //     // setTimeout(function(){
      //     //   wx.navigateBack({
      //     //     detal:2
      //     //   })
      //     // },900)
      //   }else{
      //     wx.showToast({
      //       title: '授权失败',
      //       icon:'none'
      //     })
      //   }
      // })
    }

  },

})