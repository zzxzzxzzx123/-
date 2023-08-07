// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  if (event.action == 'getlist') {
    if( event.label =='全部'){
      return await db.collection('s_info').where({
        school_id: event.s_id
      }).orderBy('_createTime', 'desc').get()
    }else{
      return await db.collection('s_info').where({
        label: event.label,
        school_id: event.s_id
      }).orderBy('_createTime', 'desc').get()
    }
 
  } else if (event.action == 'getmylist') {
    if( event.label =='全部'){
      return await db.collection('s_info').where({
        _openid: event._openid
      }).orderBy('_createTime', 'desc').get()
    }else{
      return await db.collection('s_info').where({
        label: event.label,
        _openid: event._openid
      }).orderBy('_createTime', 'desc').get()
    }
 
  } else if (event.action == 'viewinfo') {
    return await db.collection('s_info').doc(event.info_id).update({
      data: {
        view: _.inc(1)
      }
    })
  } else if (event.action == 'addcomment') {
    return await db.collection('s_comment').add({
      data: {
        info_id: event.info_id,
        comment: event.comment,
        nick_name: event.nick_name,
        avatar_url: event.avatar_url,
        _createTime: event._createTime,
        _openid: wxContext.OPENID
      }
    })
  } else if (event.action == 'getcomment') {
    return await db.collection('s_comment').where({
      info_id: event.info_id
    }).orderBy('_createTime', 'desc').get()
  } else if (event.action == 'deletecomment') {
    return await db.collection('s_comment').doc(event.comment_id).remove()
  }






  // if (event.action == 'getAll') { //获取所有未被接单的需求
  //   return await db.collection('w_misson').where({
  //     state: event.state
  //   }).orderBy('_createTime', order).get()
  // } else if (event.action == 'getmisson') {
  //   return await db.collection('w_misson').where({
  //     _openid: wxContext.OPENID,
  //     state: event.state
  //   }).orderBy('_createTime', order).get()
  // } else if (event.action == 'admingetmison') {
  //   return await db.collection('w_misson').where({
  //     m_sid: event.sid,
  //     state: event.state
  //   }).orderBy('_createTime', order).get()
  // } else if (event.action == 'pass') {
  //   let changeState =  await db.collection('w_misson').doc(event._id)
  //     .update({
  //       data: {
  //         state: 1 //状态 通过
  //       }
  //     })
  //     console.log(changeState)
  //     if(changeState.stats && changeState.stats.updated > 0){
  //      let addmoney = await db.collection('w_userinfo').where({_openid:event.useropenid})
  //       .update({
  //         data: {
  //           u_parse: _.inc(Number(event.realmoney))
  //         }
  //       })
  //       console.log(addmoney,'addmondy')
  //       if (addmoney.stats && addmoney.stats.updated > 0) {
  //         let time = new Date().getTime()
  //       let his = await db.collection('w_history').add({
  //           data: {
  //             time: time ,
  //             type:'佣金入账',
  //             mid: 'root',
  //             money: '+'+ event.realmoney,
  //             openid: event.useropenid
  //           }
  //         })
  //         return his
  //       }
  //     }
  // } else if (event.action == 'unpass') { 
  //   return await db.collection('w_misson').doc(event._id)
  //     .update({
  //       data: {
  //         state: 2 ,//状态  不通过
  //         reason: event.reason
  //       }
  //     })
  // }
}