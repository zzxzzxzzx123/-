// pages/mine/tabledate/tabledate.js
const db = wx.cloud.database();//全局变量放在page外面
Page({

  /**
   * 页面的初始数据
   */
  data: {
	  "Serial":"",
	  "area":"",
	  "industry":"",
	  "code":"",
	  "custom":"",
	  "director":"",
	  "notes":"",
     List: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
onLoad:function(options) {
    db.collection('tabledate').get({
      success: res=>{
        console.log('请求成功',res)//res.data包含该记录的数据
        this.setData({
          List: res.data
        })
      },
      fail(err){
        console.log('请求失败',err)
      }
    })
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

  }
})