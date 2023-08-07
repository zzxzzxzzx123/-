import {
  floor
} from '../../config/config.default';
const db = wx.cloud.database();
const limit = 20;
let tabsIndex = 0;
let floorIndex = 0;
var interstitialAd = null;

Page({

  data: {
    floorList: floor,
    applyData: [],
    idList:'',
    loginOpenid:'',
    configData:{},
    openid:""
  },

  onShow: function () {
    this.getOpenid();
    this.getApplyData();
    this.onShareMessage();
  },
  onLoad:function(){
    // let gonggao = wx.getStorageSync('gonggao');
    // if(!gonggao){
    //   wx.showModal({
    //     title:"公告",
    //     content:"欢迎来到机房申报小程序，如想要体验管理员权限，请联系作者添加",
    //     showCancel:false,
    //     success:res=>{
    //       wx.setStorageSync('gonggao', true);
    //     }
    //   })
    // }
  },
  
  onShareAppMessage: function () {
    return {
      title: this.data.configData.title,
      path: this.data.configData.path,
      imageUrl: this.data.configData.imageUrl,
      success: res => {
        console.log(res)
      },
      fail: err => {
        console.log(err)
      }
    }
  },

  /* 触底刷新 */
  onReachBottom: function () {
    !this.data.isEndOfList && this.getApplyData();
    
  },

  /* 选择状态 */
  selectStatus(e) {
    const {
      index
    } = e.detail;
    tabsIndex = index;
    this.setData({
      applyData: []
    })
    this.getApplyData();
    
  },
  /* 获取用户的openid */
  getOpenid() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      console.log("openid:",res.result.openid);
      this.getUserRole(res.result.openid);
      this.setData({
        openid: res.result.openid
      })
      this.data.openid = res.result.openid
    }).catch(err => {
      console.log(err);
    })
  },
  /* 获取申报数据 */
  async getApplyData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let openid = wx.getStorageSync('openid');
    const res = await db.collection('c_apply').orderBy('createTime', 'desc').where({
      _openid:openid,
      status:"未处理"
    }).skip(this.data.applyData.length).get();
    this.setData({
      applyData: [...this.data.applyData, ...res.data],
      isEndOfList: res.data.length < limit ? true : false
    })
    wx.hideLoading();
  },

  /* 跳转申报页 */
  toPublish() {
    wx.navigateTo({
      url: '../publish/publish'
    })
  },

  /* 跳转我的申报 */
  toMyRepair() {
    wx.navigateTo({
      url: '../mine/myrepair/myrepair'
    })
  },

  /*跳转已完成的 */
  toOverList() {
    wx.navigateTo({
      url: '../overlist/overlist'
    })
  },

  /* 跳转管理页 */
  toAdmin() {
    if (this.data.isAdmin) {
      wx.requestSubscribeMessage({
        tmplIds: ['yT-oyIq2AUQRVeyic3rFGkubqcOVx1BWG8DzW65SETI'],
      })
      wx.navigateTo({
        url: '../admin/admin'
      })
    } else {
      console.log(this.data.isAdmin+"");
      wx.showModal({
        cancelColor: 'cancelColor',
        title:"提示",
        content:"您不是工作人员，无法进入本功能",
        showCancel:false
      })
    }
  },
  /* 获取角色列表 */
  getUserRole(openid) {
    db.collection('c_role').get().then(res => {
      const openidList = res.data.map((item) => {
        if (item.role === '超级管理员' && item.using == true) {
          // wx.setStorageSync('admin', item);
          return item.openid;
        }
      })
      // console.log(res);
      wx.setStorageSync('admins', res.data);
      const isAdmin = openidList.includes(openid);
      this.setData({
        isAdmin
      })
    })
  },

  /* 查看申报表 */
  navDetail(e) {
    const {
      id
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../detail/detail?id=' + id
    })
  },

  /* 获取分享数据 */
  onShareMessage() {
    wx.cloud.callFunction({
      name:'getConfig'
    }).then(res=>{
      this.setData({
        configData:res.result.data[0]
      })
    })
  },
  //删除自己发布的
  deleteMeSend(e){
    const{id} = e.currentTarget.dataset
    db.collection('c_apply').where({_id : id}).get({
      success:res=>{
        // console.log("listOpenid",res.data[0]._openid)
        let listOpenid = res.data[0]._openid;
        wx.cloud.callFunction({
          name: 'login'
        }).then(res => {
          // console.log("loginOpenid:",res.result.openid);
          if(res.result.openid === listOpenid){
            this.deleteApplyData(e);
          }else{
            wx.showModal({
              title:"提示",
              content:"您不是该申报的发布者，无法删除这条数据！",
              showCancel:false
            })
          }
        }).catch(err => {
          console.log(err);
        })
      }
    })
   },
     /* 删除申报数据 */
  deleteApplyData(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '温馨提示',
      content: '确认删除此申报数据？',
      success: (res) => {
        if(res.confirm) {
          wx.showLoading({
            title: '删除中...',
            mask: true
          })
          db.collection('c_apply').doc(id).remove().then(res => {
            this.setData({
              applyData: []
            })
            this.getApplyData();
            wx.hideLoading();
            wx.showToast({
              title: '删除成功',
              duration: 500
            })
          })
        }
      }
    })
  },
  //联系我们跳转
  ContactusBtn(){
    wx.navigateTo({
      url: '/pages/sendContact/sendContact',
    })
  }
})

