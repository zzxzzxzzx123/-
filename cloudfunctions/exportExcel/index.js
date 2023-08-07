const cloud = require('wx-server-sdk')
//这里最好也初始化一下你的云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
//操作excel用的类库
const xlsx = require('node-xlsx');

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    // let getdata = await cloud.database().collection('c_apply').get();
    let applydata = event.exportData;
    //1,定义excel表格名
    // let dataCVS = '汇总表报表.xlsx'
    let dataCVS = event.fileName;
    //2，定义存储数据的
    let alldata = [];
    let row = ['时间', '申报人姓名', '申报人电话', '联系地址', '问题描述', '申报类型', '处理状态','处理人姓名','处理人手机号','申报反馈',"普通申报次数","紧急申报次数"]; //表属性
    alldata.push(row);

    let level1 = [];
    let level2 = [];
    // let level3 = []; 

    for(var i = 0;i<applydata.length;i++){
      if (applydata[i].level == "普通申报") {
        level1.push(applydata[i])
      }
      if (applydata[i].level == "紧急申报") {
        level2.push(applydata[i])
      }
      // if (applydata[i].level == "停用") {
      //   level3.push(applydata[i])
      // }
    }
     
    for (let key in applydata) {
      let num = 0;
      let arr = [];
      arr.push(applydata[key].createTime);
      arr.push(applydata[key].name);
      arr.push(applydata[key].phone);
      arr.push(applydata[key].address);
      arr.push(applydata[key].desc);
      arr.push(applydata[key].level);
      arr.push(applydata[key].status);
      arr.push(applydata[key].admin_name);
      arr.push(applydata[key].admin_phone);
      arr.push(applydata[key].admin_tallText);
      arr.push(level1.length);
      arr.push(level2.length);
      // arr.push(level3.length);
      alldata.push(arr)
    }
    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: "mySheetName",
      data: alldata
    }]);
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

  } catch (e) {
    console.error(e)
    return e
  }
}