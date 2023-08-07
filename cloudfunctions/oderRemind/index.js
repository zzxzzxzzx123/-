// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

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
    user: '1973245308@qq.com', //邮箱账号
    pass: 'iaxreqxjuvhydfbg' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
// 云函数入口函数
exports.main = async(event, context) => {
  console.log(event,"event")
  console.log(context,"context")
  // 创建一个邮件对象
  var mail = {
    // 发件人
    from: '1973245308 <1973245308@qq.com>',
    // 主题
    subject: '[小程序来信]新的汇总表！',
    // 收件人
    to: 'lzwxgzs@163.com',
    // 邮件内容，text或者html格式
    text: '请及时前往小程序查看该汇总表详细情况！' //可以是链接，也可以是验证码
  };

  let res = await transporter.sendMail(mail);
  return res;
}
