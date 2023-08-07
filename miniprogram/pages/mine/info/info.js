const app = getApp()
let _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg:{},
    temp:false,
    realName:"",
    realPhone:"",
    realaddress:"",
    realemail:"",
    openid:"",
    userInfo:{}
  },
  getData(){
    let phone = wx.getStorageSync('phone');
    let logo = wx.getStorageSync('logo');
    this.setData({
      phone,
      logo
    })
  },
  formSubmit(e){
    // wx.showLoading({
    //   title: '加载中',
    //   task:true
    // })    
    if (e.detail.value.realName != '' && e.detail.value.realPhone != ''){
      if(e.detail.value.realPhone.length == 11){
        if (!(/^1[34578]\d{9}$/.test(e.detail.value.realPhone))) {
          wx.showToast({
          title: '手机号码有误',
          duration: 2000,
          icon:'none'
          });
        }else{
          wx.setStorageSync("realName",e.detail.value.realName);
          wx.setStorageSync("realPhone",e.detail.value.realPhone);
          wx.setStorageSync("realemail",e.detail.value.realemail);
          wx.showToast({
            title: '保存成功',
            icon:'success'
          })
          wx.reLaunch({
            url: '../mine',
          })
        }
      }else{
        wx.showModal({
          title: '提交失败',
          content: '请输入正确的手机号'
        })
      }
    }else{
     wx.showModal({
          title: '提交失败',
          content: '请保证所有内容不能为空'
        })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   this.getData();
   
  },
  onShow:function(){
    if((this.data.realName == null || this.data.realName == "") && (this.data.realPhone == null || this.data.realPhone == "") && (this.data.realemail == null || this.data.realemail == "")){
      var name = wx.getStorageSync("realName");
      var phone = wx.getStorageSync("realPhone");
      var email = wx.getStorageSync("realemail");
      this.setData({
        realName:name,
        realPhone:phone,
        realemail:email
      })
      this.getOpenid();
    }
  },
  getOpenid(){
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      console.log("openid:",res.result.openid);
      this.setData({
        openid: res.result.openid
      })
    }).catch(err => {
      console.log(err);
    })
  },

  /* 一键复制 */
  callApplOpenid() {
    wx.setClipboardData({
      data: this.data.openid,
    })
  },
  //下次一定按钮
  goindex(){
    wx.showModal({
      cancelColor: 'cancelColor',
      title:"提示",
      content:"不补全个人信息，无法使用个人中心页面的功能哦~",
      success(res){
        if(res.confirm){
          wx.reLaunch({
            url: '../../index/index',
          }) 
        }
      }
    })
  },
  /**
   * 废弃 2022-11-07
   * author:程序员阿鑫
   */
  // chooseAddressData(){
  //   wx.chooseAddress({
  //     success:res=>{
  //       console.log(res)
  //       this.setData({
  //         realaddress:res.provinceName+res.cityName+res.countyName+res.detailInfo
  //       })
  //     }
  //   })
  // }

})