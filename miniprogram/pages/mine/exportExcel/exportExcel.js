const db = wx.cloud.database()
const _ = db.command
import {
  moment
} from '../../../utils/moment';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: "0",
    picker: ['全部', '近三天', '近七天', '近十五天'],
    isSelect: false,
    exportData: "",
    fileName: "汇总表",
    chartData: {},
    chartData2: {}
  },
  PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },

  one(e) {
    let repTime = e.detail.value.replace(/-/g, '/');
    console.log("返回时间：" + repTime); //转换格式
    let timeTamp = Date.parse(repTime); //转时间戳
    let one = timeTamp

    this.setData({
      repTime,
      one
    })
  },

  two(e) {
    let repTime2 = e.detail.value.replace(/-/g, '/');
    console.log("返回时间：" + repTime2); //转换格式
    let timeTamp = Date.parse(repTime2); //转时间戳
    let two = parseInt(timeTamp + 86400000)

    this.setData({
      repTime2,
      two
    })

  },
  changeSelect(e) {
    this.setData({
      isSelect: e.detail.value
    })
  },
  buttonClick() {
    let that = this;
    //判断开关是否打开
    if (this.data.isSelect) {
      //将选择的时间转为时间戳
      let one = parseInt(that.data.one)
      let two = parseInt(that.data.two)
      console.log(one, two)
      //判断是否选中时间，没有选中转为时间戳是NaN
      if (isNaN(one) || isNaN(two)) {
        wx.showToast({
          title: '起始时间或终止时间不能为空',
          icon: "none"
        })
      } else {
        db.collection('c_apply').where({
          timestamp: _.and(_.gte(one), _.lte(two))
        }).get().then(res => {
          console.log(res)
          this.setData({
            exportData: res.data
          })
          this.exportData();
        })
      }
    } else {
      //如果没有打开开关，那么就按条件选择筛选
      //当前选中的下标
      let selectValue = this.data.index;
      console.log(selectValue)
      //获取当前时间并转为时间戳
      let nowDate = Date.parse(moment("YYYY-MM-DD").replace(/-/g, '/')) + 86400000;
      //声明起始时间，最近几天就用当前时间减去天数
      let pastDate = "";
      console.log(nowDate, "nowDate")
      //判断选中的条件
      switch (selectValue) {
        case "0":
          //查询全部的查询语句
          db.collection('c_apply').get().then(res => {
            console.log(res)
            this.setData({
              exportData: res.data
            })
            this.exportData();
          })
          break;
        case "1":
          pastDate = nowDate - (86400000 * 3);
          console.log(pastDate, "pastDate");
          break;
        case "2":
          pastDate = nowDate - (86400000 * 7);
          console.log(pastDate, "pastDate");
          break;
        case "3":
          pastDate = nowDate - (86400000 * 15);
          console.log(pastDate, "pastDate");
          break;
      }
      //近三天、近七天、近十五天的查询语句
      if (pastDate != "") {
        db.collection('c_apply').where({
          timestamp: _.and(_.gte(pastDate), _.lte(nowDate))
        }).get().then(res => {
          console.log(res)
          this.setData({
            exportData: res.data
          })
          this.exportData();
        })
      }
      // else{
      //   // if(selectValue.length <= 1){
      //   //   selectValue = "0"+selectValue
      //   // }
      //   // console.log(Date.parse(moment("YYYY")+'/'+selectValue))
      //   // db.collection('c_apply').where({
      //   //   createTime:selectValue
      //   // }).get().then(res => {
      //   //   console.log(res)
      //   // })
      //   // db.collection('c_apply').where({
      //   //   createTime: {
      //   //     $regex:'.*'+Date.parse(moment("YYYY")+'/'+selectValue),
      //   //     $options:'i'
      //   //   }
      //   // }).get().then(res => {
      //   //   console.log(res)
      //   // })
      // }
    }
  },

  //导出方法，单独拿出来，放一起并发执行，获取不到数据
  exportData() {
    console.log(this.data.exportData, "exportData")
    let that = this;
    if (this.data.exportData != null && this.data.exportData.length > 0) {
      if (this.data.fileName != "" && this.data.fileName.length > 0) {
        wx.showLoading({
          title: '正在导出'
        })
        wx.cloud.callFunction({
          name: "exportExcel",
          data: {
            exportData: this.data.exportData,
            fileName: this.data.fileName + ".xls"
          },
          success(res) {
            console.log("读取成功", res.result.fileID)
            wx.hideLoading();
            wx.showToast({
              title: '导出成功,粘贴到浏览器下载',
              icon: "none"
            })

            that.setData({
              exportDateTime: moment("YYYY-MM-DD hh:mm:ss")
            })
            that.getFileUrl(res.result.fileID);
            // that.copyFileUrl()
          },
          fail(res) {
            console.log("读取失败", res)
          }
        })
        // 刷新当前页面
        that.onLoad();
        console.log("页面重载")
      } else {
        wx.showToast({
          title: '文件名不能为空',
          icon: "none"
        })
      }
    } else {
      wx.showToast({
        title: '当前选择无数据，无法导出',
        icon: "none"
      })
    }
  },
  //获取云存储文件下载地址，这个地址有效期一天
  getFileUrl(fileID) {
    let that = this;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        // get temp file URL
        console.log("文件下载链接", res.fileList[0].tempFileURL)
        that.setData({
          fileUrl: res.fileList[0].tempFileURL
        })
      },
      fail: err => {
        // handle error
      }
    })
  },
  //复制excel文件下载链接
  copyFileUrl() {
    let that = this
    wx.setClipboardData({
      data: that.data.fileUrl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log("复制成功", res.data) // data
          }
        })
      }
    })
  },
  inputFileName(e) {
    this.setData({
      fileName: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

    //todo 当前的年月日 存入appdata   wxml  {{nowdata}}
    let enddate = moment('YYYY-MM-DD');

    this.setData({
      enddate: enddate
    })
    this.getChartsData()
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

  },
  getChartsData() {
    /* 获取申报数据 */
    db.collection('c_apply').get().then(res => {
      console.log(res)
      let leixing1 = [];
      let leixing2 = [];
      let leixing3 = [];
      let level1 = [];
      let level2 = [];
      let level3 = []; 
      for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].status == "未处理") {
          leixing1.push(res.data[i])
        }
        if (res.data[i].status == "处理中") {
          leixing2.push(res.data[i])
        }
        if (res.data[i].status == "已处理") {
          leixing3.push(res.data[i])
        }
        if (res.data[i].level == "普通申报") {
          level1.push(res.data[i])
        }
        if (res.data[i].level == "紧急申报") {
          level2.push(res.data[i])
        }
      }
      let charData = {
        series: [{
          data: [{
            "name": "未处理",
            "value": leixing1.length
          }, {
            "name": "处理中",
            "value": leixing2.length
          }, {
            "name": "未处理",
            "value": leixing3.length
          }]
        }]
      }
      let charData2 = {
        categories: ["普通申报","紧急申报"],
        series: [
          {
            name: "数量",
            data: [level1.length,level2.length,level3.length]
          }
        ]
      }
      this.setData({
        chartData: charData,
        chartData2:charData2
      })
    })
  },
})