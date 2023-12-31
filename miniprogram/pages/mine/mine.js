const app = getApp();
const accountInfo = wx.getAccountInfoSync();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    needUpdate:'获取中',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    login: false,
    userroot:false,
    isAdmin:false,
    openid:'',
    phone:'',
    userinfo:{},
    kefuPhone:""
  },
  about(){
    wx.navigateTo({
      url: './about/about',
    })
   },
   getData(){
    let phone = wx.getStorageSync('phone');
    let logo = wx.getStorageSync('logo');
    let realName = wx.getStorageSync('realName');
    this.setData({
     phone,logo,realName
    })

    //  //获取系统配置中的电话
    //  wx.cloud.callFunction({
    //   name:'getConfig'
    // }).then(res=>{
    //   // console.log(res.result.data[0].kefu_phone)
    //   this.setData({
    //     kefuPhone:res.result.data[0].kefu_phone
    //   })
    // })
   },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },
  // bindGetUserInfo: function(e) {
  //   this.onLoad()
  // },
  getOpenid: function() {
    
    let that = this;
    // wx.cloud.callFunction({
    //   name: 'login',
    //   complete: res => {
    //     // console.log('云函数获取到的openid: ', res.result)
    //     var openid = res.result.openid;
    //     that.setData({
    //       openid: openid
    //     })
    //     wx.setStorage({
    //       key: 'openid',
    //       data: that.data.openid
    //     })
    //    // wx.setStorageSync('key', data)
    //   }
    // })
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      var openid = res.result.openid;
          that.setData({
            openid: openid
          })
          wx.setStorage({
            key: 'openid',
            data: that.data.openid
          })
      // console.log("openid:",res.result.openid);
      //这里是去获取当前的角色
      this.getUserRole(res.result.openid);
      
    }).catch(err => {
      console.log(err);
    })
    
  },
  /**
   * 个人中心权限标志
   */
  userRoot:function(e){
    var localopenid = wx.getStorageSync("openid");
    db.collection('c_role').where({openid : localopenid}).get({
      success:res=>{
        // console.log("listOpenid",res.data[0].role)
        let role = res.data[0].role;
        if(role == "超级管理员"){
          this.setData({
            userroot:true
          })
        }
      }
    })
  },
  //进入登录页面
  gologin:function(){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
    /**
   * 进入个人信息
   */
  gotoInfoPage:function(){
    wx.navigateTo({
      url: './info/info',
    })
  },
  
  gototabledate:function(){  //进入汇总表数据
    wx.navigateTo({
      url: './tabledate/tabledate',
    })
  },
  

  /** 进入我的申报 */
  gotoMyrepair:function(){
      wx.navigateTo({
        url: './myrepair/myrepair',
      })
  },
  /** 进入关于我们 */
  gotoAboutPage:function(){
    wx.navigateTo({
      url: './about/about',
    })
  },
  //电话客服
  makePhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.kefuPhone,
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
  shouquan() {
    wx.requestSubscribeMessage({
      tmplIds: ["gJUrOIFd3wG49fSX5wBIUbTexJmAotvSPJH-ZF5NkzA"],
      success(res) {
        console.log('授权成功', res)
        wx.showToast({
          title: '订阅授权成功',
        })
      },
      fail(res) {
        console.log('授权失败', res)
        wx.showToast({
          title: '订阅授权失败',
          icon: 'none'
        })
      }
    })
  },
  //跳转生成报表
  toexportEmail() {
    if (this.data.isAdmin) {
      wx.navigateTo({
        url: './exportExcel/exportExcel'
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
    var that = this;
    // console.log(openid);
    db.collection('c_role').where({openid:openid,role:'超级管理员',using:true}).get().then(res=>{
      console.log(res)
      if(res.data.length>0){
        wx.setStorageSync('admin',res.data);
      // that.userroot = true;
        this.setData({
          userroot:true,
          isAdmin:true
        })
      }
    })

    // db.collection('c_role').get().then(res => {
    //   const openidList = res.data.map((item) => {
    //     if (item.role === '超级管理员') {
    //       wx.setStorageSync('admin', item);
    //       that.userroot = true;
    //     } 
    //     return item.openid;
    //   })
    //   const isAdmin = openidList.includes(openid);
    //   this.setData({
    //     isAdmin
    //   })
    // })
  },
  applyAdmin(){
    console.log(111)
    wx.navigateTo({
      url: 'applyAdmin/applyAdmin',
    })
  },
  //系统版本更新
  autoUpdate: function () {
    var self = this
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      //1. 检查小程序是否有新版本发布
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log('版本内容', res)
        if (res.hasUpdate) {
          //检测到新版本，需要更新，给出提示
          self.setData({
            needUpdata: '更新新版本'
          })
          wx.showModal({
            title: '更新提示',
            content: '检测到新版本，是否下载新版本并重启小程序？',
            success: function (res) {
              if (res.confirm) {
                //2. 用户确定下载更新小程序，小程序下载及更新静默进行
                self.downLoadAndUpdate(updateManager)
              } else if (res.cancel) {
                //用户点击取消按钮，需要强制更新，二次弹窗
                wx.showModal({
                  title: '温馨提示~',
                  content: '本次版本更新涉及到新的功能添加，旧版本无法正常访问的哦~',
                  showCancel: false,
                  confirmText: "确定更新",
                  success: function (res) {
                    if (res.confirm) {
                      //下载新版本，并重新应用
                      self.downLoadAndUpdate(updateManager)
                    }
                  }
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '版本无需更新',
            icon: 'none'
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  downLoadAndUpdate: function (updateManager) {
    var self = this
    wx.showLoading();
    //静默下载更新小程序新版本
    updateManager.onUpdateReady(function () {
      wx.hideLoading()
      //新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showModal({
        title: '已经有新版本了哟~',
        content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getOpenid()
    this.getData();
    let phone = wx.getStorageSync('phone');
    let logo = wx.getStorageSync('logo');

      if(phone == "" || logo == ""){
        this.gologin(); 
      }else{
        let name = wx.getStorageSync("realName");
        let phone = wx.getStorageSync("realPhone");
        let email = wx.getStorageSync("realemail");
        if((name == null || name == '') || (phone == null || phone == '') || (email == null || email == '')){
        wx.showModal({
          title:'温馨提示',
          content: '请补全您的姓名、邮箱、手机号，以便于以后的申报',
          showCancel:false,
          success:res=>{
            this.gotoInfoPage();
          }
        })
      }
      }
      var self = this
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log("版本是否更新:" + res.hasUpdate)
        if (res.hasUpdate) {
          self.setData({
            needUpdate: '有新版本可更新'
          })
        } else {
          let version = accountInfo.miniProgram
          console.log("版本摘要:" + version)
          self.setData({
            needUpdate: version.version
          })
        }
      })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})