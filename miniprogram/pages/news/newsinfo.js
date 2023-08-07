// pages/schoolinfo/info_detail.js
const app = getApp()
const db = wx.cloud.database()
// const util = require("../../utils/util");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardCur:0,
    InputBottom: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let phone = wx.getStorageSync('phone');
    let logo = wx.getStorageSync('logo');
     
    if(!phone && !logo){
      wx.showToast({
        title: '登录态失效，请先登录',
      })
      wx.switchTab({
        url: '/pages/index/index',
      })    
    }else{
      this.setData({
        phone,logo
       })
    this.data.info_id = options.info_id
   this.getDetail(this.data.info_id)
   this.getComment(this.data.info_id)
   this.addView(this.data.info_id)
    }
  },
  addView(id){
  wx.cloud.callFunction({
    name:'getCampusInfo',
    data:{
      action:'viewinfo',
      info_id: this.data.info_id
    }
  }).then(res=>{
 
  })
  },
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  getDetail(id){
    wx.showLoading({
      title: '加载中',
    })
  db.collection('s_info').doc(id).get().then(res=>{
    console.log(res)
    wx.hideLoading()
    this.setData({
      info:res.data
    })
  })
  },
  InputFocus(e) {
    this.setData({
      InputBottom: e.detail.height
    })
  },
  InputBlur(e) {
    this.setData({
      InputBottom: 0
    })
  },
  inputComment(e){
  this.data.comment = e.detail.value
  },
  postComment() {
    let neirong = this.data.comment
    if (!neirong) {
      wx.showToast({
        icon: 'error',
        title: '请输入评论内容'
      })

    } else {

      wx.showLoading({
        title: '校验信息中',
        icon: 'none'
      })

      wx.cloud.callFunction({
        name: 'msgSC',
        data: {
          des: this.data.comment
        }
      }).then(res => {

        console.log("检查", res)
        if (res.result.code == "200") {

          wx.cloud.callFunction({
            name: 'getCampusInfo',
            data: {
              action: 'addcomment',
              comment: this.data.comment,
              info_id: this.data.info_id,
              nick_name: wx.getStorageSync('userInfo').nickName,
              avatar_url: wx.getStorageSync('userInfo').avatarUrl,
              _createTime: new Date().getTime(),
              
            }
          }).then(res => {
            console.log(res)
            if (res.result.errMsg == 'collection.add:ok') {
              wx.hideLoading()
              wx.showToast({
                title: '发表成功',
              })
              this.getComment(this.data.info_id)
            }
          })
        } else {
          wx.showToast({
            title: '包含敏感信息',
            icon: 'error'
          })
        }

      })
    }

  },
  getComment(id){
  wx.cloud.callFunction({
  name:'getCampusInfo',
  data:{
    action:'getcomment',
    info_id: id
  }
  }).then(res=>{
    console.log(res)
    this.setData({
      commentInfo: res.result.data,
      comment:''
    })
  })
  },
  makePhoneCall(){
    wx.makePhoneCall({
      phoneNumber: this.data.info.phone,
    })
  },
  deleteComment(e){
    console.log(e)
    let _this = this
    wx.showModal({
      title: '提示',
content: '是否删除当前评论？',
success (res) {
if (res.confirm) {
console.log('用户点击确定')
wx.cloud.callFunction({
  name:'getCampusInfo',
  data:{
    action: 'deletecomment',
     comment_id :  e.currentTarget.dataset.comment_id
  }
}).then(res=>{
  console.log(res)
  if(res.result.errMsg == 'document.remove:ok'){
  wx.showToast({
    title: '删除成功',
  })
  _this.getComment(_this.data.info_id)
  }
})
} else if (res.cancel) {
console.log('用户点击取消')
}
}
    })

  },

  showModal(e) {
    console.log(e)
    this.setData({
      modalName: 'Image',
      url: e.currentTarget.dataset.url
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null, 
      url:''
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})