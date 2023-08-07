const db = wx.cloud.database();
import {
  moment
} from '../../../utils/moment';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: "",
    email: "",
    phone: "",
    name: "",
    adminList: [],
    isDevAdmin:false,
    usingFalseAdmins:[]
  },
  setEmail(e) {
    console.log(e)
    this.setData({
      email: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let openid = wx.getStorageSync('openid')
    let name = wx.getStorageSync('realName')
    let phone = wx.getStorageSync('realPhone')
    this.setData({
      openid,
      name,
      phone
    })
    this.getUserRole()
    this.getDevAdmin()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  stopset() {
    wx.showToast({
      title: '自动获取，不可编辑',
      icon: "none"
    })
  },
  /* 获取角色列表 */
  getUserRole() {
    db.collection('c_role').where({
      openid: wx.getStorageSync('openid'),
      role: '超级管理员'
    }).get().then(res => {
      console.log(res)
      this.setData({
        adminList: res.data
      })
    })
  },
  sendApply() {
    this.getUserRole()
    if (this.data.email == "") {
      wx.showToast({
        title: '邮箱不能为空',
        icon: "none"
      })
      return;
    }
    // this.email()
    console.log(this.data.adminList.length <= 0)
    console.log(this.data.adminList)
    if (this.data.adminList.length <= 0) {
      let nowDate = Date.parse(moment("YYYY-MM-DD hh:mm:ss").replace(/-/g, '/'));
      db.collection("c_role").add({
        data: {
          name: this.data.name,
          email: this.data.email,
          phone: this.data.phone,
          openid: this.data.openid,
          role: "超级管理员",
          using: false,
          _createTime:nowDate,
          applyTime:moment("YYYY-MM-DD hh:mm:ss")
        }
      }).then(res => {
        console.log(res)
        wx.showToast({
          title: '提交成功，请耐心等待审核',
          icon: "none",
        })
        this.onShow()
      }).catch(err => {
        console.log(err)
      })
    }else{
      wx.showModal({
        title:"提示",
        content:"您已经申请了，请勿重复申请",
        showCancel:false
      })
    }

  },
  getList(){
    wx.showToast({
      title: '操作成功',
      icon:"none"
    })
    this.getDevAdmin()
  },
  //正则判断邮箱格式
  email: function () {
    /*this.data.textV为获取的输入内容*/
    console.log(this.data.email)
    let str = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/

    if (str.test(this.data.email)) {
      /*格式正确*/
    } else {
      /*格式不正确，弹窗提示*/
      wx.showToast({
        title: '请输入正确邮箱',
        icon: "none"
      })
    }

  },
  deleteApply(){
    wx.showModal({
      title:"误点提示",
      content:"确认删除？",
      success:res=>{
        if(res.confirm){
          wx.showLoading({
            title: '加载中...'
          })
          db.collection("c_role").where({openid:this.data.openid}).remove().then(res=>{
            console.log(res)
            wx.showToast({
              title: '删除成功',
              icon:"none"
            })
            this.getUserRole()

            wx.hideLoading()
          }).catch(err=>{
            console.log(err)
          })
        }
      }
    })
  },
})