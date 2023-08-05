// pages/mine/index.js
const app = getApp();
import Toast from '@vant/weapp/toast/toast';
import { isOnline, reviewCode } from '../../utils/env';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    reviewApiLoaded: false,
    isReview: true,
    avatarUrl: '',
    nickname: '',
    phone: '',
    role: 0,
    permissionShow: false,
    permissionActions: [
      {
        id: 1,
        name: '授权为管理员',
        openType: 'share',
      },
      {
        id: 2,
        name: '授权为业务员',
        openType: 'share',
      },
      {
        id: 3,
        name: '授权为风控',
        openType: 'share',
      },
    ],
    selectPermWay: 2,
  },

  setProfile() {
    wx.navigateTo({
      url: '../profile/index',
      // events: {
      //   setProfile: (data) => {
      //     console.log(data);
      //     this.setData(data);
      //   },
      // },
      // success: (res) => {
      //   // 通过eventChannel向被打开页面传送数据
      //   res.eventChannel.emit('acceptDataFromOpenerPage', {
      //     avatarUrl: this.data.avatarUrl,
      //     nickname: this.data.nickname,
      //     phone: this.data.phone,
      //   });
      // },
    });
  },
  linkToSearch() {
    wx.navigateTo({
      url: '/pages/search/index',
    });
  },
  linkToMyApply() {
    wx.navigateTo({
      url: '/pages/search/index?isMine=1',
    });
  },

  async previewQrCode() {
    if (!app.globalData.userInfo.phone) {
      wx.navigateTo({ url: '../profile/index' });
      return;
    }
    if (app.globalData.userInfo.referenceQr) {
      wx.previewImage({
        urls: [app.globalData.userInfo.referenceQr],
        showmenu: true,
      });
      return;
    }
    Toast.loading({
      message: '正在加载...',
      forbidClick: true,
      duration: 0,
    });
    try {
      const { result: res } = await wx.cloud.callFunction({
        name: 'getQrCode',
      });
      if (res.code === 0) {
        Toast.clear();
        wx.previewImage({
          urls: [res.data],
          showmenu: true,
        });
      } else {
        Toast.fail('获取失败');
      }
    } catch (e) {
      console.log(e);
      Toast.fail('获取失败');
    }
  },

  linkToPermission() {
    // wx.navigateTo({
    //   url: '../permission/index',
    // });
    this.setData({ permissionShow: true });
  },
  closePermission() {
    this.setData({ permissionShow: false });
  },
  selectPermWay(e) {
    // console.log(e);
    this.data.selectPermWay = e.detail.id;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    // console.log(options);
    if (!app.globalData.reviewApiLoaded) {
      Toast.loading({
        message: '正在加载...',
        forbidClick: true,
        duration: 0,
      });
      const accountInfo = wx.getAccountInfoSync();
      console.log(accountInfo);
      try {
        if (accountInfo.miniProgram.envVersion === 'release') {
          const { result: res } = await wx.cloud.callFunction({
            name: 'settings',
            data: { $url: 'getSettings' },
          });
          app.globalData.isReview = res.data[reviewCode];
          console.log(res);
        } else {
          app.globalData.isReview = isOnline;
        }
      } catch (e) {
        console.log(e);
      }
      app.globalData.reviewApiLoaded = true;
    }
    this.setData({
      isReview: app.globalData.isReview,
      reviewApiLoaded: app.globalData.reviewApiLoaded,
    });
    setTimeout(() => {
      Toast.clear();
    }, 1000);
    if (app.globalData.isReview) return;

    // 审核后
    if (options.role && options.pcode) {
      wx.cloud
        .callFunction({
          name: 'settings',
          data: {
            $url: 'acceptPerm',
            role: +options.role,
            pcode: options.pcode,
          },
        })
        .then(({ result: res }) => {
          console.log(res);
          if (res.code === 0) {
            Object.assign(app.globalData.userInfo, res.data);
            this.setData({
              nickname: res.data.nickname,
              avatarUrl: res.data.avatarUrl,
              phone: res.data.phone,
              role: res.data.role,
            });
          }
        })
        .catch((err) => {
          Toast.fail('用户信息获取失败');
        })
        .finally(() => {
          app.globalData.loadingStatus = 2;
        });
    } else if (app.globalData.loadingStatus === 0) {
      app.globalData.loadingStatus = 1;
      wx.cloud
        .callFunction({
          name: 'user',
          data: { $url: 'getUser' },
        })
        .then(({ result: res }) => {
          console.log(res);
          if (res.code === 0) {
            Object.assign(app.globalData.userInfo, res.data);
            this.setData({
              nickname: res.data.nickname,
              avatarUrl: res.data.avatarUrl,
              phone: res.data.phone,
              role: res.data.role,
            });
          }
        })
        .catch((err) => {
          Toast.fail('用户信息获取失败');
        })
        .finally(() => {
          app.globalData.loadingStatus = 2;
        });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (!app.globalData.reviewApiLoaded) return;
    if (app.globalData.isReview) return;
    if (app.globalData.loadingStatus === 2 && app.globalData.userInfo.phone) {
      if (app.globalData.userInfo.phone !== this.data.phone)
        this.setData({ phone: app.globalData.userInfo.phone });
      if (app.globalData.userInfo.nickname !== this.data.nickname)
        this.setData({ nickname: app.globalData.userInfo.nickname });
      if (app.globalData.userInfo.avatarUrl !== this.data.avatarUrl)
        this.setData({ avatarUrl: app.globalData.userInfo.avatarUrl });
      if (app.globalData.userInfo.role !== this.data.role)
        this.setData({ role: app.globalData.userInfo.role });
    }
  },

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
  onShareAppMessage(e) {
    if (e.from === 'button') {
      Toast.loading({
        message: '生成中...',
        forbidClick: true,
        duration: 0,
      });
      const promise = wx.cloud
        .callFunction({
          name: 'settings',
          data: {
            $url: 'setPermCodes',
            role: this.data.selectPermWay,
          },
        })
        .then(({ result: res }) => {
          Toast.clear();
          this.setData({ permissionShow: false });
          if (res.code === 0) {
            return {
              title: '业务授权邀请',
              imageUrl:
                'https://7169-qiying-master-0gosoksr4fb5c562-1319845952.tcb.qcloud.la/qrcode/gh_a9ea83aa8a7d_1280.jpg?sign=801c17a9f8b155763dd3817afb7e385a&t=1690894201',
              path: `/pages/mine/index?role=${this.data.selectPermWay}&pcode=${res.data}`,
            };
          } else {
            Toast.fail(res.msg);
          }
        })
        .catch((e) => {
          Toast.fail('授权失败');
        });
      return {
        title: '启赢信息咨询服务',
        imageUrl:
          'https://7169-qiying-master-0gosoksr4fb5c562-1319845952.tcb.qcloud.la/qrcode/gh_a9ea83aa8a7d_1280.jpg?sign=801c17a9f8b155763dd3817afb7e385a&t=1690894201',
        path: '/pages/mine/index',
        promise,
      };
    }
  },
});
