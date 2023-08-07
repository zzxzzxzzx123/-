const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
exports.main = async (event, context) => {
  console.log(event)
  try {
    const result = await cloud.openapi.cloudbase.sendSms({
        "env": "wx60cc46e3ad6a02bd",
        "phoneNumberList": event.phoneNumberList,
        "smsType": event.smsType,
        "useShortName":event.useShortName,
        "content":event.smsContent,
        "path":event.smsPath,
        "templateParamList": event.templateParamList
      })
    return result
  } catch (err) {
    return err
  }
}