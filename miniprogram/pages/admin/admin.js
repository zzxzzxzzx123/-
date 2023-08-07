import {
  floor
} from '../../config/config.default';
const db = wx.cloud.database()
const limit = 20;
let floorIndex = 0;

Page({

  data: {
    tabList: [{
      name: '当前未处理',
      status: '未处理'
    }, {
      name: '正在处理中',
      status: '处理中'
    }, {
      name: '当前已处理',
      status: '已处理'
    }],
    tabsIndex: 0,
    applyData: [],
    id:"",
    index:"",
    nowOrderData:"",
    adminTallText:"",
    configData:""
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
  onShow: function () {
    this.getApplyData();
    this.getConfigData();
  },

  setadminTallText(e){
    console.log(e.detail.value)
    this.setData({
      adminTallText: e.detail.value
    })
  },
  /* 触底刷新 */
  onReachBottom: function() {
    !this.data.isEndOfList && this.getApplyData();
  },

  /* 选择状态 */
  selectStatus(e) {
    console.log(e)
    const {
      index
    } = e.detail;
    this.data.tabsIndex = index;
    this.setData({
      applyData: []
    })
    this.getApplyData();
  },

  // /* 选择栋数 */
  // selectFloor(e) {
  //   const {
  //     index
  //   } = e.detail;
  //   floorIndex = index;
  //   if (index === 0) {
  //     this.setData({
  //       applyData: []
  //     })
  //     this.getApplyData();
  //   } else {
  //     this.getApplyDataItem(floorIndex);
  //   }
  // },

  /* 获取申报数据 */
  async getApplyData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    const res = await db.collection('c_apply').orderBy('createTime', 'asc').where({
      status: this.data.tabList[this.data.tabsIndex].status,
      floor: floorIndex === 0 ? {} : floorIndex
    }).skip(this.data.applyData.length).get();
    this.setData({
      applyData: [...this.data.applyData, ...res.data],
      isEndOfList: res.data.length < limit ? true : false
    })
    wx.hideLoading();
  },

  /* 选择栋数获取申报数据 */
  // async getApplyDataItem(floor) {
  //   wx.showLoading({
  //     title: '加载中...',
  //     mask: true
  //   })
  //   await db.collection('c_apply').orderBy('createTime', 'desc').where({
  //     floor: floor,
  //     status: this.data.tabList[tabsIndex].status
  //   }).get().then(res => {
  //     this.setData({
  //       applyData: res.data
  //     })
  //     wx.hideLoading();
  //   }).catch(err => {
  //     console.log(err)
  //   })
  // },

  showModalView(e) {
    const { id, index } = e.currentTarget.dataset;
    console.log(id,index)
    this.setData({
      id:id,
      index:index,
      nowOrderData:this.data.applyData[index],
      modalName: e.currentTarget.dataset.target
    })
    
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  // 接单
  jiedanApplyData(e){
      wx.showModal({
        title: '温馨提示',
        content: '确认处理？',
        success:res => {
          if(res.confirm) {
            this.setData({
              applyDataItem: this.data.applyData[this.data.index]
            })
          
            wx.showLoading({
              title: '处理中...',
              mask: true
            })

            let name = wx.getStorageSync('realName');
            let phone = wx.getStorageSync('realPhone');
            console.log(this.data.id,"点击的id")
            db.collection('c_apply').where({_id: e.currentTarget.dataset.id}).update({
              data: {
                status: '处理中',
                admin_name:name,
                admin_phone:phone
              }
            }).then(res => {
              console.log(res)
              this.setData({
                applyData: []
              })
              this.getApplyData();
              wx.hideLoading();
              wx.showToast({
                title: '处理成功',
                duration: 500
              })
              this.hideModal();
              this.sendHandleNotice();
              this.sendEmailNotice(1,e.currentTarget.dataset.id);
              this.sendSms("1",e.currentTarget.dataset.id);
            })
          }
        }
      })
  },
  /* 更新申请状态 */
  updateApplyStatus(e) {
    console.log(this.data.adminTallText)
    if(this.data.adminTallText != "" && this.data.adminTallText.length > 0){
      wx.showModal({
        title: '温馨提示',
        content: '确认此申报数据？',
        success: (res) => {
          if(res.confirm) {
            this.setData({
              applyDataItem: this.data.applyData[this.data.index]
            })
            wx.showLoading({
              title: '处理中...',
              mask: true
            })

            let name = wx.getStorageSync('realName');
            let phone = wx.getStorageSync('realPhone');
            db.collection('c_apply').where({_id: this.data.id}).update({
              data: {
                status: '已处理',
                admin_name:name,
                admin_phone:phone,
                admin_tallText:this.data.adminTallText
              }
            }).then(res => {
              this.setData({
                applyData: []
              })
              this.getApplyData();
              wx.hideLoading();
              wx.showToast({
                title: '处理成功',
                duration: 500
              })
              this.hideModal();
              // this.sendHandleNotice();
              this.sendSms("2",this.data.id);
              this.sendEmailNotice(2,this.data.id);
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '不能为空!',
        icon:"none"
      })
    }
  },
  //发送短信通知
  sendSms(type,id){
    wx.cloud.callFunction({
      name:'getSmsContent'
    }).then(res=>{
      console.log(res.result.data[0])
      let smsContent = res.result.data[0];
      let text = ""
      //1为接单，2为维修完成
      if(type == 1){
        text = smsContent.user_orderText
      }else{
        text = smsContent.user_remindText
      }

      
      if(smsContent.isopen){
        db.collection('c_apply').where({_id: id}).get().then(res => {
          console.log(res)
          wx.cloud.callFunction({
            name:"sendSms",
            data:{
              //管理员手机号码
              phoneNumberList:['+86'+res.data[0].phone],
              //短信类型：通知类
              smsType:'Notification',
              //云开发静态网址，云开发短信资源包调用无需配置此项
              smsPath:'',
              //自定义短信内容，不需要填写，有固定模板，直接传递变量
              smsContent:'',
              //签名是否使用短名称，默认false
              useShortName:false,
              //模板参数 一共两个参数（内容，静态网址路径）
              templateParamList:[text,smsContent.sms_url]
            }
          }).then(res => {
            console.log(res);
          })
        })
      }
    })
  },
  //发送邮件通知
  sendEmailNotice(num,id){
    console.log(num,id)
    let sendType = 0;
    if(num == 1){
      sendType = 3;
    }else{
      sendType = 4;
    }
    // console.log(sendType,"sendType")
    db.collection('c_apply').where({_id: id}).get().then(res => {
      console.log(res,"汇总表信息 <---------------------------")
      if(res.data[0].email != ""){
        wx.cloud.callFunction({
          name: 'sendEmail',
          data: {
            sendType:sendType,
            sendEamil:res.data[0].email,
            admin_name:res.data[0].admin_name,
            admin_phone:res.data[0].admin_phone,
            name:res.data[0].name,
          }
        }).then(res => {
          console.log(res);
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

  /* 发送处理通知 */
  sendHandleNotice(e) {
    // console.log(this.data.applyDataItem._openid);
    console.log(this.data)
    wx.cloud.callFunction({
      name: 'handleNotice',
      data: {
        name: wx.getStorageSync('admin').name,
        dorm: this.data.applyData.address,
        phone: wx.getStorageSync('admin').phone,
        status: '处理中',
        // remarks: '祝您生活愉快!',
        // openid: this.data.appyT-oyIq2AUQRVeyic3rFGkubqcOVx1BWG8DzW65SETIlyDataItem._openid,
        templateId: this.data.configData.handle_notice
      }
    }).then(res => {
      console.log(res);
    })
  },

  /* 查看申报表 */
  navDetail(e) {
    const {
      id,
      admin
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../detail/detail?id=' + id + '&admin=' + admin
    })
  },

})