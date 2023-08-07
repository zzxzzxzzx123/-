// pages/schoolinfo/schoolinfo.js
const app = getApp()
const db = wx.cloud.database()
// const util = require("../../utils/util");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 0,
    scrollLeft:0
  },
 
  navTo(e){
    app.com.navTo(e)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let area = wx.getStorageSync('area')
    this.setData({
      area
    })
  this.getGroup()
  wx.stopPullDownRefresh()
  },
  getGroup(){
  db.collection('s_group').orderBy('sort',"desc").get().then(res=>{
    console.log(res)
    this.setData({
      groupList: res.data
    })
    this.getCampusInfo(res.data[0].title)
  })
  },
  getCampusInfo(label){
    wx.showLoading({
      title: '加载中',
    })
   wx.cloud.callFunction({
     name:'getCampusInfo',
     data:{
     action:'getmylist',
     _openid: wx.getStorageSync('user').openid,
     label: label
     }
   }).then(res=>{
     wx.stopPullDownRefresh()
     console.log(res)
     this.setData({
       infoList:res.result.data
     })
     wx.hideLoading()
   })
  },
  tabSelect(e) {
    console.log(e)
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id-1)*60
    })
    this.getCampusInfo(this.data.groupList[e.currentTarget.dataset.id].title)
  },
  goToeditInfo(e){
  wx.navigateTo({
    url: '/pages/news/newsinfo?info_id='+ e.currentTarget.dataset.infoid,
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
  this.onLoad()
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
  this.getCampusInfo(this.data.groupList[this.data.TabCur].title)
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