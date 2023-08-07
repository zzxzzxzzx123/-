// pages/mine/about/about.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    configData:{}
  },
  getConfigData(){
    wx.cloud.callFunction({
      name:'getConfig'
    }).then(res=>{
      console.log(res.result.data[0])
      this.setData({
        configData:res.result.data[0]
      })
    })
  },
  sendDuanxin(){
    wx.cloud.callFunction({
      name:'shortMeg'
    }).then(res=>{
      console.log(res)
    })
  },
   /* 一键复制 */
   callApplyWechat() {
    wx.setClipboardData({
      data: "zzx2001628",
    })
  },
   /* 一键联系 */
  makePhone() {
    wx.makePhoneCall({
			phoneNumber: '15622260757'
		})
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.getConfigData();
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