// pages/search/index.js
const app = getApp();
import Toast from '@vant/weapp/toast/toast';
import { formatTime } from '../../utils/index';
const applyStatusMap = {
  0: '审核中',
  1: '审批通过',
  2: '审批拒绝',
};
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
    applyStatus: '',
    applyStatusTxt: '',
    applyStatusPickerShow: false,
    applyStatusColumns: [
      { id: 0, value: '审核中' },
      { id: 1, value: '审批通过' },
      { id: 2, value: '审批拒绝' },
    ],
    page: 1,
    size: 10,
    total: 0,
    searchList: [],
    isMine: false,
    role: 0,
    isAdmin: false,
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
  openApplyStatusPicker() {
    this.setData({ applyStatusPickerShow: true }, () => {
      if (typeof this.data.applyStatus === 'number') {
        this.selectComponent('.applyStatusPicker').setColumnIndex(
          0,
          this.data.applyStatus,
        );
      }
    });
  },
  closeApplyStatusPicker() {
    this.setData({ applyStatusPickerShow: false });
  },
  applyStatusConfirm(e) {
    // console.log(e);
    const { id, value } = e.detail.value;
    this.setData({
      applyStatus: id,
      applyStatusTxt: value,
      applyStatusPickerShow: false,
    });
  },

  onReset() {
    this.setData({
      username: '',
      phone: '',
      dateTxt: ' ',
      date: [],
      applyStatus: '',
      applyStatusTxt: '',
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
          applyStatus: this.data.applyStatus,
        },
      });
      console.log(res);
      if (res.code === 0) {
        Toast.clear();
        let searchList = res.data.map((d) => ({
          ...d,
          applyDateTxt: formatTime(d.applyDate, 'yyyy/MM/dd'),
          applyStatusTxt: applyStatusMap[d.applyStatus],
        }));
        this.setData({
          total: res.total,
          searchList:
            this.data.page === 1
              ? searchList
              : this.data.searchList.concat(searchList),
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

  onDetailDelete(e) {
    console.log(e);
    const { id, username } = e.target.dataset;
    wx.showModal({
      title: `确定删除【${username}】的申请？`,
      confirmColor: '#FF0000',
      complete: (res) => {
        if (res.cancel) {
        }

        if (res.confirm) {
          Toast.loading({
            message: '正在删除...',
            forbidClick: true,
            duration: 0,
          });
          wx.cloud
            .callFunction({
              name: 'search',
              data: {
                $url: 'removeDetail',
                id,
              },
            })
            .then(({ result: res }) => {
              if (res.code === 0) {
                Toast.success('删除成功');
                this.setData({
                  searchList: this.data.searchList.filter((d) => d._id !== id),
                  total: this.data.total - 1,
                });
              } else {
                Toast.fail(res.msg);
              }
            })
            .catch((e) => {
              Toast.fail('删除失败');
            });
        }
      },
    });
  },

  onDetailExport(e) {
    console.log(e);
    const { id } = e.target.dataset;
    Toast.loading({
      message: '正在导出...',
      forbidClick: true,
      duration: 0,
    });

    wx.cloud
      .callFunction({
        name: 'export',
        data: {
          $url: 'exportDetail',
          id,
        },
      })
      .then(({ result: res }) => {
        if (res.code === 0) {
          Toast.loading({
            message: '正在下载...',
            forbidClick: true,
            duration: 0,
          });
          wx.downloadFile({
            url: res.data,
            success(resD) {
              if (resD.statusCode === 200) {
                const filePath = resD.tempFilePath;
                Toast.loading({
                  message: '正在打开...',
                  forbidClick: true,
                  duration: 0,
                });
                wx.openDocument({
                  filePath: filePath,
                  showMenu: true,
                  success: function (res) {
                    console.log(res, '打开文档成功');
                    Toast.clear();
                  },
                  fail() {
                    Toast.fail('打开失败');
                  },
                });
              } else {
                Toast.fail('下载失败');
              }
            },
            fail() {
              Toast.fail('下载失败');
            },
          });
        } else {
          Toast.fail(res.msg);
        }
      })
      .catch((e) => {
        Toast.fail('导出失败');
      });
  },
  onListExport(e) {
    Toast.loading({
      message: '正在导出...',
      forbidClick: true,
      duration: 0,
    });

    wx.cloud
      .callFunction({
        name: 'export',
        data: {
          $url: 'exportList',
          phone: this.data.phone,
          username: this.data.username,
          date: this.data.date,
          isMine: this.data.isMine,
          applyStatus: this.data.applyStatus,
        },
      })
      .then(({ result: res }) => {
        if (res.code === 0) {
          Toast.loading({
            message: '正在下载...',
            forbidClick: true,
            duration: 0,
          });
          wx.downloadFile({
            url: res.data,
            success(resD) {
              if (resD.statusCode === 200) {
                const filePath = resD.tempFilePath;
                Toast.loading({
                  message: '正在打开...',
                  forbidClick: true,
                  duration: 0,
                });
                wx.openDocument({
                  filePath: filePath,
                  showMenu: true,
                  success: function (res) {
                    console.log(res, '打开文档成功');
                    Toast.clear();
                  },
                  fail() {
                    Toast.fail('打开失败');
                  },
                });
              } else {
                Toast.fail('下载失败');
              }
            },
            fail() {
              Toast.fail('下载失败');
            },
          });
        } else {
          Toast.fail(res.msg);
        }
      })
      .catch((e) => {
        Toast.fail('导出失败');
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      page: 1,
      isMine: options.isMine ? true : false,
      role: app.globalData.userInfo.role || 0,
      isAdmin: app.globalData.userInfo.isAdmin || false,
    });
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
