// pages/schoolinfo/info_edit.js
const app = getApp()
const db = wx.cloud.database()
// const util = require("../../utils/util");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    img: [],
    is_show: false,
    is_anony: false,
    is_open: true,
    agreementFlag: true,
    label: '',
    title: '',
    detail: ''
  },


  agreement: function () {
    wx.showModal({
      title: '《网络信息内容生态治理规定》',
      showCancel: false,
      content: '网络信息内容生产者不得制作、复制、发布含有下列内容的违法信息：\r\n 1、反对宪法所确定的基本原则的；\r\n 2、危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；\r\n 3、损害国家荣誉和利益的；\r\n 4、歪曲、丑化、亵渎、否定英雄烈士事迹和精神，以侮辱、诽谤或者其他方式侵害英雄烈士的姓名、肖像、名誉、荣誉的；\r\n 5、宣扬恐怖主义、极端主义或者煽动实施恐怖活动、极端主义活动的；\r\n 6、煽动民族仇恨、民族歧视，破坏民族团结的；\r\n 7、破坏国家宗教政策，宣扬邪教和封建迷信的；\r\n 8、散布谣言，扰乱经济秩序和社会秩序的；\r\n 9、散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；\r\n 10、侮辱或者诽谤他人，侵害他人名誉、隐私和其他合法权益的；\r\n 11、法律、行政法规禁止的其他内容。'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // let area = wx.getStorageSync('area')
    let area = {
      name: "卓为信息科技"
    }
    let realPhone = wx.getStorageSync('realPhone');
    let realName = wx.getStorageSync('realName');
    let logo = wx.getStorageSync('logo');
    if (!realPhone && !logo) {
      wx.showToast({
        title: '登录态失效，请先登录',
      })
      wx.switchTab({
        url: '/pages/index/index',
      })
    } else {
      if (options.info_id) {
        let info_id = options.info_id
        this.setData({
          info_id
        })
        this.getInfo(info_id)
      }
      this.setData({
        area,realPhone,logo,realName
      })
      this.getGroup()
      this.data.school_id = area.pk_id
      console.log(this.data.userinfo)
    }
  },
  getInfo(id) {
    wx.showLoading({
      title: '获取中',
    })
    db.collection('s_info').doc(id).get().then(res => {
      console.log(res)
      wx.hideLoading()
      this.setData({
        label: res.data.label,
        title: res.data.title,
        detail: res.data.detail,
        img: res.data.img
      })
    })
  },
  getGroup() {
    db.collection('s_group').orderBy('sort', "desc").get().then(res => {
      console.log(res)
      let groupList = []
      res.data.forEach(i => {
        groupList.push(i.title)
      })
      console.log(groupList)
      this.setData({
        groupList
      })
    })
  },
  PickerChange(e) {
    console.log(e)
    this.setData({
      label: this.data.groupList[e.detail.value]
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
  uploadImage() {
    let that = this

    wx.chooseMedia({
      count: 4,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        console.log(res)
        var tempFiles = res.tempFiles
        wx.showLoading({
          title: '上传中',
        })
        tempFiles.forEach(item => {
          console.log(item)
          wx.cloud.uploadFile({
            cloudPath: "img/" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000),
            filePath: item.tempFilePath,
          }).then(res => {
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
  showModal(e) {
    console.log(e)
    this.setData({
      modalName: e.currentTarget.dataset.target,
      url: e.currentTarget.dataset.url
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null,
      url: ''
    })
  },
  anonyPublish(e) {
    console.log(e)
    this.data.is_anony = e.detail.value
  },
  agreementFlag(e) {
    this.data.agreementFlag = e.detail.value
  },
  publicContact(e) {
    this.data.is_open = e.detail.value
  },
  inputTitle(e) {
    this.data.title = e.detail.value
  },
  inputDetail(e) {
    this.data.detail = e.detail.value
  },
  //信息校验预处理
  toSubmit() {
    if (this.data.label == '') {
      wx.showToast({
        title: '请选择分类',
        icon: 'none'
      })
      return
    }
    if (this.data.title == '') {
      wx.showToast({
        title: '请填写标题',
        icon: 'none'
      })
      return
    }
    if (this.data.detail == '') {
      wx.showToast({
        title: '请填写内容',
        icon: 'none'
      })
      return
    }
    if (!this.data.agreementFlag) {
      wx.showToast({
        title: '请同意《网络信息内容生态治理规定》协议',
        icon: 'none'
      })
      return
    }
    if (this.data.is_anony == true) {
      this.data.userinfo.nickName = '匿名用户'
      this.data.userinfo.avatarUrl = 'https://s1.ax1x.com/2022/05/20/OXF92j.png'
    }
    if (this.data.is_open == false) {
      this.data.userinfo.phone = ''
    }
    wx.showLoading({
      title: '校验信息中',
      icon: 'none'
    })
    wx.cloud.callFunction({
      name: 'msgSC',
      data: {
        des: this.data.title + ',' + this.data.detail
      }
    }).then(res => {
      if (res.result.code == "200") {
        this.setData({
          is_click: true
        })
        wx.showLoading({
          title: 'loading',
        })
        if (this.data.info_id) {
          this.update()
        } else {
          this.add()
        }
      } else {
        wx.showTost({
          title: '发布信息中包含敏感词汇！',
          icon: 'none'
        })
      }
    })
  },
  add() {
    db.collection('s_info').add({
      data: {
        _createTime: new Date().getTime(),
        school_id: this.data.school_id,
        label: this.data.label,
        title: this.data.title,
        detail: this.data.detail,
        img: this.data.img,
        nickname: this.data.realName,
        avatarurl: this.data.logo,
        gender: 0,
        phone: this.data.realPhone,
        view: 0,
        like: 0,
      }
    }).then(res => {
      console.log(res)
      wx.hideLoading()
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      })
      wx.navigateBack()
    })
  },
  update() {

    db.collection('s_info').doc(this.data.info_id).update({
      data: {
        school_id: this.data.school_id,
        label: this.data.label,
        title: this.data.title,
        detail: this.data.detail,
        img: this.data.img,
        nickname: this.data.userinfo.nickName,
        avatarurl: this.data.userinfo.avatarUrl,
        gender: this.data.userinfo.gender,
        phone: this.data.userinfo.phone,
      }
    }).then(res => {
      console.log(res)
      if (res.stats.updated == 1) {
        wx.showToast({
          title: '修改成功',
        })
        wx.hideLoading()
        wx.navigateBack()

      } else {
        wx.showToast({
          title: '修改失败',
          icon: 'none'
        })
      }
    })
  },
  deleteInfo() {
    let _this = this
    wx.showModal({
      title: '提示',
      content: '是否删除本条资讯信息？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          db.collection('s_info').doc(_this.data.info_id).remove().then(res => {
            console.log(res)
            if (res.errMsg == "document.remove:ok") {
              wx.showToast({
                title: '删除成功',
              })
              wx.navigateBack()
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
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