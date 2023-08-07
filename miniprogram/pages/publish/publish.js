import { moment } from '../../utils/moment';
const db = wx.cloud.database();

Page({

  data: {
    level: '普通申报',
    realName:"",
    realPhone:"",
    configData:"",
    realaddress:"",
    detail_postion: "",
    realemail:"",
    img:[],
	
	    "Serial":"",
	    "area":"",
	    "industry":"",
	    "code":"",
	    "custom":"",
	    "director":"",
	    "notes":"",
		
    numList: [{
      name: '基本信息'
    }, {
		name: '汇总表'
		}, {
      name: '汇总描述'
    },{
      name: '完成'
    }, ],
    num: 0,
    scroll: 0
  },
  
   bindSubmit:function(res){
      console.log(res)
      
      var Serial = res.detail.value.Serial
      var area = res.detail.value.area
      var industry = res.detail.value.industry
      var code = res.detail.value.code
      var custom = res.detail.value.custom
      var director = res.detail.value.director
      var notes = res.detail.value.notes
   
   //    userNumber = Number(userNumber)
   //    getNumber = Number(getNumber)
   //    getPrice = Number(getPrice)
   
      wx.showLoading({
        title: '汇总表提交中...',
        mask: "true"
      })
      db.collection("tabledate").add({
        data: {
          "Serial":Serial,
          "area":area,
          "industry":industry,
          "code":code,
          "custom":custom,
          "director":director,
          "notes":notes
        },
        success: function(res){
          console.log(res)
          wx.hideLoading()
        }
      })
    },


  
  //选择excel表
    chooseExcel(){
      let that = this;
      wx.chooseMessageFile({
        count: 1,
        //extension: [],
        type: 'file',
        success: (result) => {
          console.log("选择Excel表成功！",result);
          let path = result.tempFiles[0].path;
          that.uploadExcel(path);//调用上传Excel到云存储的方法
        },
        fail: (res) => {},
        complete: (res) => {},
      })
    },
   
    //上传Excel到云存储
    uploadExcel(path){
      let that = this;
      wx.cloud.uploadFile({
        cloudPath : new Date().getTime() + '.xls',
        filePath : path,
        success:function(res){
          console.log("上传Excel到云存储成功！",res);
          that.parseExcel(res.fileID);//解析Excel表
        },
        fail:function(err){
          console.log("上传Excel到云存储失败！",err);
        }
      })
    },
   
    //解析Excel表
    parseExcel(fileId){
      wx.cloud.callFunction({
        name : 'excel',
        data : {
          fileID : fileId
        },
        success(res){
          console.log("解析Excel表成功！",res);
        },
        fail(err){
          console.log("解析Excel表失败！",err);
        }
      })
    },

  
  
  

  numSteps() {
    this.setData({
      num: this.data.num == this.data.numList.length - 1 ? 0 : this.data.num + 1
    })
  },
  backSteps(){
    this.setData({
      num: this.data.num - 1
    })
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


  onLoad: function(opstion) {
    const{
      id
    }=opstion;
    if(id!=null && id!=""){
      console.log("汇总表ID："+id);
      db.collection('c_apply').where({
        _id: id
      }).get().then(res => {
        console.log(res.data[0]);
        this.setData({
          data: res.data[0],
        })
      }).catch(err => {
        console.log(err)
      })
    }
    this.getConfigData();
  },
  onShow:function(){
    if (wx.getStorageSync('phone') == null || wx.getStorageSync('logo') == null) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
    let realName = wx.getStorageSync("realName");
    let realPhone = wx.getStorageSync('realPhone');
    let realemail = wx.getStorageSync('realemail');
    let logo = wx.getStorageSync('logo');
    this.setData({
      realName,realPhone,logo,realemail
    })
  },
  /* 申报人 */
  setName(e) {
    this.setData({
      realName: e.detail.value
    })
  },
  // setAddress(e){
  //   if (this.data.realaddress == "") {
  //     wx.showToast({
  //       title: '请先选择地址再填写',
  //       icon: "none"
  //     })
  //     return "";
  //   }
  //   this.setData({
  //     detail_postion: e.detail.value
  //   })
  // },
  setEmail(e){
    this.setData({
      realemail: e.detail.value
    })
  },
  /* 联系电话 */
  setPhone(e) {
    this.setData({
      realPhone: this.data.userinfo.phone
    })
  },

  /* 申报描述 */
  setDesc(e) {
    this.setData({
      desc: e.detail.value
    })
  },

  /* 选择维修级别 */
  selectLevel(e) {
    console.log(e)
    this.setData({
      level: e.detail
    })
  },
  clickLevel(e) {
    console.log(e)
    this.setData({
      level: e.currentTarget.dataset.level
    })
  },
  /* 提交申报表 */
  inApplyData() {
    // wx.requestSubscribeMessage({
    //   tmplIds: [this.data.configData.handle_notice]
    // })
    if(this.validate()) {
          wx.showLoading({
            title: '正在提交...',
            mask: true
          })
            db.collection('c_apply').add({
              data: {
                userlogo:this.data.logo,
                name: this.data.realName.trim(),
                // address:this.data.realaddress + this.data.detail_postion, 地址数据库字段
                phone: this.data.realPhone.trim(),
                email: this.data.realemail.trim(),
                desc: this.data.desc,
                imgs:this.data.img,
                level: this.data.level,
                levelIcon: this.data.levelIcon,
                status: '未处理',
                createTime: moment('YYYY-MM-DD hh:mm:ss'),
                timestamp:Date.parse(new Date())
              }
            }).then(res => {
              wx.hideLoading();
              //提交成功
              wx.showToast({
                title: '提交成功',
                icon:'success',
                duration:1000
              })
              this.sendSms();
              this.sendApplyNotice();
              wx.reLaunch({
                url: '../index/index?id=success',
              })
            }).catch(err => {
              console.log(err)
            })
        }
   
  },
  sendSms(){
    wx.cloud.callFunction({
      name:'getSmsContent'
    }).then(res=>{
      console.log(res.result.data[0])
      let smsContent = res.result.data[0];
      if(smsContent.isopen){
        db.collection('c_role').where({"using":true}).get().then(res=>{
          console.log(res)
          res.data.forEach(item=>{
            wx.cloud.callFunction({
              name:"sendSms",
              data:{
                //管理员手机号码
                phoneNumberList:['+86'+item.phone],
                //短信类型：通知类
                smsType:'Notification',
                //云开发静态网址，云开发短信资源包调用无需配置此项
                smsPath:'',
                //自定义短信内容，不需要填写，有固定模板，直接传递变量
                smsContent:'',
                //签名是否使用短名称，默认false
                useShortName:false,
                //模板参数 一共两个参数（内容，静态网址路径）
                templateParamList:[smsContent.admin_remindText,smsContent.sms_url]
              }
            }).then(res => {
              console.log(res);
            })
          })
        })
      }
    })
  },
  /* 发送邮件申报订单提醒 */
  sendApplyNotice() {
    db.collection('c_role').where({"using":true}).get().then(res => {
      res.data.forEach(item=>{
        console.log(item)
        wx.cloud.callFunction({
          name: 'sendEmail',
          data: {
            sendType:2,
            name:this.data.realName,
            sendEamil:item.email,
            address: this.data.realaddress,
            desc: this.data.desc,
            phone: this.data.realPhone,
            // templateId: this.data.configData.handle_notice
          }
        }).then(res => {
          console.log(res);
        })
      })
    })
  },
  DelImg(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除这张图片吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.img.splice(e.currentTarget.dataset.index, 1);
          this.setData({
           img: this.data.img
          })
        }
      }
    })
  },
  
 
  
  
  
  
  uploadImage(){              //上传图片方法
    let that = this

    wx.chooseMedia({
      count: 4,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType:['compressed'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        console.log(res)
        var tempFiles = res.tempFiles
        wx.showLoading({
          title: '上传中',
        })
        tempFiles.forEach(item=>{
          console.log(item)
          wx.cloud.uploadFile({
            cloudPath: "img/" + new Date().getTime() +"-"+ Math.floor(Math.random() * 1000),
            filePath :item.tempFilePath,
          }).then(res=>{
          wx.hideLoading()
            that.setData({
              img: that.data.img.concat(res.fileID)
            })
            console.log(that.data.img)
          })
        })
      }
    })
   
  },
  /* 申报表单验证 */
  validate() {
    let cp = /[1][3,4,5,7,8][0-9]{9}$/;
   
    if (this.data.realName === ''  || !this.data.realName) {
      wx.showToast({
        title: '请填写申报人',
        icon: 'error',
        duration: 1000
      })
      return false;
    }
    // if (this.data.realaddress === ''|| !this.data.realaddress) {     //方法判断数据库address字段是否为空
    //   wx.showToast({
    //     title: '请填写故障地址',
    //     icon: 'error',
    //     duration: 1000
    //   })
    //   return false;
    // }
    // if (this.data.img.length <= 0) {
    //   wx.showToast({
    //     title: '请添加相关图片',
    //     icon: 'error',
    //     duration: 1000
    //   })
    //   return false;
    // }
    if (this.data.realPhone === ''  || !this.data.realPhone) {
      wx.showToast({
        title: '请填写手机号码',
        icon: 'error',
        duration: 1000
      })
      return false;
    }
    if (!cp.test(this.data.realPhone)) {
      wx.showToast({
        title: '请填写正确手机号',
        icon: 'error',
        duration: 1000
      })
      return false;
    }
    // if (this.data.desc === '' || !this.data.desc) {
    //   wx.showToast({
    //     title: '请增加更改描述',
    //     icon: 'error',
    //     duration: 1000
    //   })
    //   return false;
    // }
    return true;
  },
   /**
   * 原因：更换点击定位
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
  
    
	//需要修改上门地址
	
	
  // chooseAddressData() {
  //   wx.chooseLocation({
  //     success: res => {
  //       console.log(res)
  //       this.setData({
  //         realaddress: res.address + res.name,
  //         postion: [res.latitude, res.longitude]
  //       })
  //       console.log(this.data.realaddress)
  //     },
  //     fail: err => {
  //       console.log(err)
  //     }
  //   })
  // }

})