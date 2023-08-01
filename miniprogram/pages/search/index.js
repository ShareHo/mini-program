// pages/search/index.js
import Toast from '@vant/weapp/toast/toast';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    phone: '',
    dateTxt: ' ',
    date: [],
    minDate: new Date('2023/06/01').getTime(),
    maxDate: new Date().getTime(),
    calendarShow: false,
    page: 1,
    size: 10,
    total: 0,
    searchList: [],
    isMine: false,
  },
  openCalendar() {
    this.setData({ calendarShow: true });
  },
  calendarClose() {
    this.setData({ calendarShow: false });
  },
  calendarConfirm(e) {
    const date = e.detail.map((d) => d.getTime());
    date[1] += 24 * 60 * 60 * 1000;
    this.setData({
      date,
      dateTxt: `${e.detail[0].getFullYear()}/${
        e.detail[0].getMonth() + 1
      }/${e.detail[0].getDate()}-${e.detail[1].getFullYear()}/${
        e.detail[1].getMonth() + 1
      }/${e.detail[1].getDate()}`,
      calendarShow: false,
    });
  },

  onReset() {
    this.setData({
      username: '',
      phone: '',
      dateTxt: ' ',
      date: [],
    });
  },
  onSearch() {
    this.setData({ page: 1 });
    this.getData();
  },

  async getData() {
    try {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
      });
      const { result: res } = await wx.cloud.callFunction({
        name: 'search',
        data: {
          $url: 'searchList',
          page: this.data.page,
          size: this.data.size,
          phone: this.data.phone,
          username: this.data.username,
          date: this.data.date,
          isMine: this.data.isMine,
        },
      });
      console.log(res);
      if (res.code === 0) {
        Toast.clear();
        this.setData({
          total: res.total,
          searchList:
            this.data.page === 1
              ? res.data
              : this.data.searchList.concat(res.data),
        });
      } else {
        Toast.fail(res.msg);
        if (this.data.page !== 1) this.setData({ page: this.data.page - 1 });
      }
    } catch (e) {
      if (this.data.page !== 1) this.setData({ page: this.data.page - 1 });
      Toast.fail('查询失败');
    }
  },

  linkToDetail(e) {
    wx.navigateTo({
      url: `/pages/detail/index?id=${e.currentTarget.dataset.id}`,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ page: 1, isMine: options.isMine ? true : false });
    this.getData();
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
  onPullDownRefresh(e) {
    this.setData({ page: 1 });
    this.getData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom(e) {
    if (this.data.page * this.data.size < this.data.total) {
      this.setData({ page: this.data.page + 1 });
      this.getData();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
