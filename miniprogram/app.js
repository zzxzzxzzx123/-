App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'gzzw-1g7ti6il9d8c706e',
        traceUser: true
      })
    }
  },
})
