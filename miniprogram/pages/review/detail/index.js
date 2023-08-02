// pages/review/detail/index.js
import Toast from '@vant/weapp/toast/toast';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detail: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);
    this.getDetail(options.id);
  },

  getDetail(id) {
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      duration: 0,
    });
    wx.cloud
      .callFunction({
        name: 'review',
        data: {
          $url: 'searchDetail',
          id,
        },
      })
      .then(({ result: res }) => {
        console.log(res);
        if (res.code === 0) {
          Toast.clear();
          this.setData({ detail: res.data });
        } else {
          Toast.fail(res.msg);
        }
      })
      .catch((e) => {
        Toast.fail('加载失败');
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
