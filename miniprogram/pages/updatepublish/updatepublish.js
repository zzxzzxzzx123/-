import {
  icon
} from '../../config/config.default';
import { moment } from '../../utils/moment';
const db = wx.cloud.database(); 

Page({

  data: {
    level: '申报',
    levelIcon: icon.ordinary,
    realName:"",
    realPhone:"",
    desc:"",
    configData:"",
    realaddress:"",
    realEmail:"",
    img:[],
    num: 0,
    scroll: 0
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
        // console.log(res.data[0]);
        this.setData({
          data: res.data[0],
          realName:res.data[0].name,
          realPhone:res.data[0].phone,
          desc:res.data[0].desc,
          realaddress:res.data[0].address,
          realEmail:res.data[0].email,
          img:res.data[0].imgs,
          level:res.data[0].level,
        })
      }).catch(err => {
        console.log(err)
      })
    }


  },
  onShow:function(){
    
  },

  /* 申报人 */
  setName(e) {
    this.setData({
      realName: e.detail.value
    })
  },

  /* 联系电话 */
  setPhone(e) {
    this.setData({
      realPhone: e.detail.value
    })
  },

  /* 申报描述 */
  setDesc(e) {
    this.setData({
      desc: e.detail.value
    })
  },
  setEmail(e){
    this.setData({
      email: e.detail.value
    })
  },

  clickLevel(e) {
    if (e.currentTarget.dataset.level === '紧急申报') {
      this.setData({
        levelIcon: icon.press
      })
    } else {
      this.setData({
        levelIcon: icon.ordinary
      })
    }
    this.setData({
      level: e.currentTarget.dataset.level
    })
  },
  /* 提交申报表 */
  inApplyData(e) {
    const {
      id
    } = e.currentTarget.dataset
    if(this.validate()) {
      wx.showLoading({
        title: '正在提交修改...',
        mask: true
      })
        db.collection('c_apply').doc(id).update({
          data: {
            name: this.data.realName.trim(),
            phone: this.data.realPhone.trim(),
            desc: this.data.desc,
            level: this.data.level,
            address:this.address,
            imgs:this.data.img,
            email:this.data.email,
            status: '未处理',
            createTime: moment('YYYY-MM-DD hh:mm:ss'),
          }
        }).then(res => {
          wx.hideLoading();
          wx.showToast({
            title: '提交成功',
            duration: 1000
          })
              //提交成功
              wx.showToast({
                title: '提交成功',
                icon:'success',
                duration:1000
              })
        
          wx.reLaunch({
            url: '../index/index?id=success',
          })
        }).catch(err => {
          console.log(err)
        })
    }
   
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
  uploadImage(){
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
        duration: 500
      })
      return false;
    }
    // if (this.data.realaddress === ''|| !this.data.realaddress) {
    //   wx.showToast({
    //     title: '请填写故障地址',
    //     icon: 'error',
    //     duration: 1000
    //   })
    //   return false;
    // }
    // if (this.data.img.length <= 0) {
    //   wx.showToast({
    //     title: '请添加故障图片',
    //     icon: 'error',
    //     duration: 1000
    //   })
    //   return false;
    // }
    if (this.data.realPhone === ''  || !this.data.realPhone) {
      wx.showToast({
        title: '请填写手机号码',
        icon: 'error',
        duration: 500
      })
      return false;
    }
    if (!cp.test(this.data.realPhone)) {
      wx.showToast({
        title: '请填写正确手机号',
        icon: 'error',
        duration: 500
      })
      return false;
    }
    // if (this.data.desc === '' || !this.data.desc) {
    //   wx.showToast({
    //     title: '请说明故障具体情况',
    //     icon: 'error',
    //     duration: 500
    //   })
    //   return false;
    // }
    return true;
  }

})