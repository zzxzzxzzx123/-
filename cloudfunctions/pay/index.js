// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext()
   let config = (await db.collection('c_config').get()).data[0];

    // let money = config.price*100;
    // if(event.totalFee == undefined || event.totalFee <= 0){
    //   console.log("type =====>>"+event.type);
    //   if(event.type){
    //     money = config.ageprice*100;
    //   }else{
    //     money = config.price*100;
    //   }
    //   console.log("money =====>>"+money);
      
    // }else{
      money = event.totalFee;
    // }
 
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : event.body, //订单说明
    "outTradeNo" : event.orderid, //单号
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : config.mch_id,  //商户号
    "totalFee" : money,  //金额（分）
    "envId": config.cloudid,  //云函数id
    "functionName": config.cloudName  //云函数名称
  })
  return res
}