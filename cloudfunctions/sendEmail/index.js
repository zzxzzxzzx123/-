// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) 

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

//引入发送邮件的类库
var nodemailer = require('nodemailer')
// 创建一个SMTP客户端配置
var config = {
  host: 'smtp.qq.com', //网易163邮箱 smtp.163.com
  port: 465, //网易邮箱端口 25
  auth: {
    user: '26******57@qq.com', //邮箱账号
    pass: 'ec**********adc' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  // 创建一个邮件对象
  var mail = {};
  //sendType 1为问题反馈  2为用户提交汇总表给管理员（所有管理员收到邮件） 3为管理员接单给用户反馈  4为管理员处理成功给用户反馈
  if (event.sendType == 1) {
    mail = {
      // 发件人
      from: '26******57 <26******57@qq.com>',
      // 主题
      subject: '[申报小程序来信]收到来自“' + event.shop_name + '”的宝贵意见/建议。',
      // 收件人(尽量管理员邮箱)
      to: '26******57@qq.com',
      // 邮件内容，text或者html格式
      // text: '该：'+event.shop_name+'先生/女士 电话为：'+event.shop_phone+'  他宝贵的意见/建议：'+event.shop_data +'  请及时与该群众联系！', //可以是链接，也可以是验证码

    };
  }
  /*
    为方便二次修改，没有把header和bottom压缩成一行
    可以压缩成一行，更加美观
    工具网址：https://c.runoob.com/front-end/47/
  */
  let header = `
  <div>
  <includetail>
      <div align="center">
          <div class="open_email" style="margin-left: 8px; margin-top: 8px; margin-bottom: 8px; margin-right: 8px;">
              <div>
                  <br>
                  <span class="genEmailContent">
                      <div id="cTMail-Wrap"
                           style="word-break: break-all;box-sizing:border-box;text-align:center;min-width:320px; max-width:660px; border:1px solid #f6f6f6; background-color:#f7f8fa; margin:auto; padding:20px 0 30px; font-family:'helvetica neue',PingFangSC-Light,arial,'hiragino sans gb','microsoft yahei ui','microsoft yahei',simsun,sans-serif">
                          <div class="main-content" style="">
                              <table style="width:100%;font-weight:300;margin-bottom:10px;border-collapse:collapse">
                                  <tbody>
                                  <tr style="font-weight:300">
                                      <td style="width:3%;max-width:30px;"></td>
                                      <td style="max-width:600px;">
                                          <div id="cTMail-logo" style="width:92px; height:25px;">
                                              <a href="https://www.cxyax.com">
                                                  <img border="0" src="https://www.cxyax.com/content/uploadfile/tpl_options//logoimg.png"
                                                       style="width:92px; height:25px;display:block">
                                              </a>
                                          </div>
                                          <p style="height:2px;background-color: #00a4ff;border: 0;font-size:0;padding:0;width:100%;margin-top:20px;"></p>

                                          <div id="cTMail-inner" style="background-color:#fff; padding:23px 0 20px;box-shadow: 0px 1px 1px 0px rgba(122, 55, 55, 0.2);text-align:left;">
                                              <table style="width:100%;font-weight:300;margin-bottom:10px;border-collapse:collapse;text-align:left;">
                                                  <tbody>
                                                  <tr style="font-weight:300">
                                                      <td style="width:3.2%;max-width:30px;"></td>
                                                      <td style="max-width:480px;text-align:left;">
                                                          <h1 id="cTMail-title" style="font-size: 20px; line-height: 36px; margin: 0px 0px 22px;">
                                                              【汇总表提醒】欢迎使用程序员阿鑫申报系统
                                                          </h1>
                                                          <p id="cTMail-userName" style="font-size:14px;color:#333; line-height:24px; margin:0;">
                                                              尊敬的管理员，您好！
                                                          </p>
  `;
  let bottom = `
    <p class="cTMail-content" style="line-height: 24px; margin: 6px 0px 0px; overflow-wrap: break-word; word-break: break-all;">
      <span style="color: rgb(51, 51, 51); font-size: 14px;">如本邮件对您造成困扰，您可以在小程序中 “我的 —— 申请管理员权限 —— 退出管理员身份”
          <span style="font-weight: bold;">如您不是管理员，但收到了本邮件，请联系QQ：1973245308 微信：FreeRoot0716</span>
      </span>
    </p>
    <p class="cTMail-content"
    style="font-size: 14px; color: rgb(51, 51, 51); line-height: 24px; margin: 6px 0px 0px; word-wrap: break-word; word-break: break-all;">
      <a id="cTMail-btn" href="https://www.cxyax.com" title=""
        style="font-size: 16px; line-height: 45px; display: block; background-color: rgb(0, 164, 255); color: rgb(255, 255, 255); text-align: center; text-decoration: none; margin-top: 20px; border-radius: 3px;">
          前往程序员阿鑫博客
      </a>
    </p>
    <p class="cTMail-content" style="line-height: 24px; margin: 6px 0px 0px; overflow-wrap: break-word; word-break: break-all;">
      <span style="color: rgb(51, 51, 51); font-size: 14px;">
          <br>
          无法正常显示？请复制以下链接至浏览器打开：
          <br>
          <a href="https://www.cxyax.com" title=""
            style="color: rgb(0, 164, 255); text-decoration: none; word-break: break-all; overflow-wrap: normal; font-size: 14px;">
            https://www.cxyax.com
          </a>
      </span>
    </p>
<dl style="font-size: 14px; color: rgb(51, 51, 51); line-height: 18px;">
  <dd style="margin: 0px 0px 6px; padding: 0px; font-size: 12px; line-height: 22px;">
      <p id="cTMail-sender" style="font-size: 14px; line-height: 26px; word-wrap: break-word; word-break: break-all; margin-top: 32px;">
          此致
          <br>
          <strong>自由仁科技</strong>
      </p>
  </dd>
</dl>
</td>
<td style="width:3.2%;max-width:30px;"></td>
</tr>
</tbody>
</table>
</div>

<div id="cTMail-copy" style="text-align:center; font-size:12px; line-height:18px; color:#999">
<table style="width:100%;font-weight:300;margin-bottom:10px;border-collapse:collapse">
<tbody>
<tr style="font-weight:300">
<td style="width:3.2%;max-width:30px;"></td>
<td style="max-width:540px;">

<p style="text-align:center; margin:20px auto 14px auto;font-size:12px;color:#999;">
  此为系统邮件，请勿回复。
</p>
<p id="cTMail-rights" style="max-width: 100%; margin:auto;font-size:12px;color:#999;text-align:center;line-height:22px;">
  <img border="0" src="https://s1.ax1x.com/2022/04/28/LOPFoV.png"
       style="width:64px; height:64px; margin:0 auto;">
  <br>
  关注公众号，获得前沿科技
  <br>
  
</p>
</td>
<td style="width:3.2%;max-width:30px;"></td>
</tr>
</tbody>
</table>
</div>
</td>
<td style="width:3%;max-width:30px;"></td>
</tr>
</tbody>
</table>
</div>
</div>
</span>
</div>
</div>
</div>
</includetail>
</div>
  `;

  if (event.sendType == 2) {
    mail = {
      // 发件人
      from: '26******57 <26******57@qq.com>',
      // 主题
      subject: '[汇总表提醒]收到来自“' + event.name + '”的汇总表。',
      // 收件人
      to: event.sendEamil,
      // 邮件内容，text或者html格式
      // text: '该：'+event.name+'先生/女士，电话为：'+event.phone+'  申报地址：'+event.address +'  故障简述：'+event.desc + '，请您尽快前往小程序处理该汇总表！', //可以是链接，也可以是验证码
      html: header + `
          <p class="cTMail-content" style="line-height: 24px; margin: 6px 0px 0px; overflow-wrap: break-word; word-break: break-all;">
            <span style="color: rgb(51, 51, 51); font-size: 14px;">
              申报人姓名：${event.name} <br/> 
              申报人电话：${event.phone} <br/>   
              申报地址：${event.address} <br/> 
              请您尽快前往小程序处理该汇总表！
            </span>
          </p>
        ` + bottom
    };
  }
  if (event.sendType == 3) {
    mail = {
      // 发件人
      from: '26******57 <26******57@qq.com>',
      // 主题
      subject: '[接单提醒]您上报的汇总表已被工程师接单了。',
      // 收件人
      to: event.sendEamil,
      // 邮件内容，text或者html格式
      // text: '您上报的维修汇总表已被维修工程师接单了，请您耐心等待工程师与您取得联系~', 
      html: header + `
        <p id="cTMail-userName" style="font-size:14px;color:#333; line-height:24px; margin:0;">
          尊敬的${event.name}，您好！
        </p>
        <p class="cTMail-content" style="line-height: 24px; margin: 6px 0px 0px; overflow-wrap: break-word; word-break: break-all;">
            <span style="color: rgb(51, 51, 51); font-size: 14px;">
            工程师姓名：${event.admin_name} <br/> 
            工程师电话：${event.admin_phone} <br/>   
            您上报的汇总表已被工作人员接单了，请耐心等待工作人员联系您并上门处理~
            </span>
        </p>
        ` + bottom
    };
  }
  if (event.sendType == 4) {
    mail = {
      // 发件人
      from: '26******57 <26******57@qq.com>',
      // 主题
      subject: '[汇总表完成提醒]您上报的汇总表已处理完成了！',
      // 收件人
      to: event.sendEamil,
      // 邮件内容，text或者html格式
      // text: '您的汇总表已维修完毕，感谢您的支持！', 
      html: header + `
          <p id="cTMail-userName" style="font-size:14px;color:#333; line-height:24px; margin:0;">
            尊敬的${event.name}，您好！
          </p>
          <p class="cTMail-content" style="line-height: 24px; margin: 6px 0px 0px; overflow-wrap: break-word; word-break: break-all;">
              <span style="color: rgb(51, 51, 51); font-size: 14px;">
              工程师姓名：${event.admin_name} <br/> 
              工程师电话：${event.admin_phone} <br/>   
              您上报的汇总表已被工作人员接单了，请耐心等待工作人员联系您并上门处理~
              </span>
          </p>
          ` + bottom
    };
  }


  let res = await transporter.sendMail(mail);
  return res;
}