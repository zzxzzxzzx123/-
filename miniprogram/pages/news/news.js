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
    scrollLeft: 0,
    userisRoot:false

  },
  goMyinfoList(){
    wx.navigateTo({
      url: './myinfoList',
    })
  },
  goInfoEdit(){
    wx.navigateTo({
      url: './infoDetail',
    })
  },
  
  userRoot:function(e){
    var localopenid = wx.getStorageSync("openid");
    db.collection('c_role').where({openid:localopenid,role:'超级管理员',using:true}).get().then(res=>{
      console.log(res)
      if(res.data.length>0){
      this.setData({
          userisRoot:true
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {

    if (wx.getStorageSync('phone') == null || wx.getStorageSync('logo') == '') {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    } else {

      // let area = wx.getStorageSync('area')
      let area = {name:"卓为信息科技"}
      this.setData({
        area
      })
      this.getGroup()
      this.userRoot()
      wx.stopPullDownRefresh()
    }

  },



  getGroup() {
    db.collection('s_group').orderBy('sort', "asc").get().then(res => {
      console.log(res)
      this.setData({
        groupList: res.data
      })
      this.getCampusInfo(this.data.groupList[this.data.TabCur].title)
    })
  },
  getCampusInfo(label) {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getCampusInfo',
      data: {
        action: 'getlist',
        s_id: wx.getStorageSync('area').pk_id,
        label: label
      }
    }).then(res => {
      wx.stopPullDownRefresh()
      console.log(res)
      this.setData({
        infoList: res.result.data
      })
      let topList = []
      console.log('12', topList)
      console.log(this.data.label)
      this.data.infoList.forEach(item => {
        if (item.is_top) {
          topList.push(item)
          this.setData({
            topList
          })
          console.log('12212', this.data.topList)
        }

      })
      wx.hideLoading()
    })
  },
  tabSelect(e) {
    console.log(e)
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
      label: this.data.groupList[e.currentTarget.dataset.id].title
    })
    this.getCampusInfo(this.data.groupList[e.currentTarget.dataset.id].title)
  },
  navToInfoDetail(e) {
    wx.navigateTo({
      url: '/pages/news/newsinfo?info_id=' + e.currentTarget.dataset.infoid,
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
    
  },

})