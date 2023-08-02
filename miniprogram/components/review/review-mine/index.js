// components/review/review-mine/index.js
Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    avatarUrl: '',
    nickname: '',
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached() {
      wx.cloud
        .callFunction({
          name: 'review',
          data: {
            $url: 'getUser',
          },
        })
        .then(({ result: res }) => {
          console.log(res);
          this.setData({
            nickname: res.data.nickname,
            avatarUrl: res.data.avatarUrl,
          });
        });
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setProfile() {
      wx.navigateTo({
        url: '/pages/review/profile/index',
        events: {
          setUser: (data) => {
            this.setData(data);
          },
        },
        success: (res) => {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('setUser', { ...this.data });
        },
      });
    },
    previewQrCode() {
      wx.previewImage({
        urls: [
          'cloud://qiying-master-0gosoksr4fb5c562.7169-qiying-master-0gosoksr4fb5c562-1319845952/qrcode/gh_a9ea83aa8a7d_1280.jpg',
        ],
        showmenu: true,
      });
    },
    makePhoneCall() {
      wx.makePhoneCall({
        phoneNumber: '13726448726',
      });
    },
    linkToMyApply() {
      wx.navigateTo({
        url: '/pages/review/search/index?isMine=1',
      });
    },
  },
});
