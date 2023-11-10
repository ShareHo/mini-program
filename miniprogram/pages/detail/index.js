// pages/detail/index.js
const app = getApp();
import Toast from '@vant/weapp/toast/toast';
import { formatTime } from '../../utils/index';
const marryStatusMap = {
  0: '已婚',
  1: '未婚',
  2: '离异',
};
const useWayMap = {
  0: '生产经营',
  1: '购买材料',
  2: '添置设备',
  3: '扩大经营模式',
};
const businessScaleMap = {
  0: '小微型企业',
  1: '小型企业',
  2: '中型企业',
  3: '大型企业',
};
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
    detail: null,
    role: 0,
    isAdmin: false,
  },

  idCardPreview(e) {
    console.log(e);
    const { index } = e.currentTarget.dataset;
    const { idCardFront, idCardBack } = this.data.detail;
    const urls = [idCardFront, idCardBack];
    wx.previewImage({
      urls,
      current: urls[index],
      showmenu: true,
    });
  },

  idCardMarryPreview(e) {
    console.log(e);
    const { index } = e.currentTarget.dataset;
    const { idCardMarryFront, idCardMarryBack } = this.data.detail;
    const urls = [idCardMarryFront, idCardMarryBack];
    wx.previewImage({
      urls,
      current: urls[index],
      showmenu: true,
    });
  },

  bizLicensePreview(e) {
    wx.previewImage({
      urls: [this.data.detail.bizLicense],
      showmenu: true,
    });
  },

  // houseCertPreview(e) {
  //   const index = e.currentTarget.dataset.index.split('-');

  //   const { certFront, certBack } = this.data.detail.houseList[index[0]];
  //   const urls = [certFront, certBack];
  //   wx.previewImage({
  //     urls,
  //     current: urls[index[1]],
  //     showmenu: true,
  //   });
  // },

  // carCertPreview(e) {
  //   const index = e.currentTarget.dataset.index.split('-');

  //   const { certFront, certBack } = this.data.detail.carList[index[0]];
  //   const urls = [certFront, certBack];
  //   wx.previewImage({
  //     urls,
  //     current: urls[index[1]],
  //     showmenu: true,
  //   });
  // },

  deleteDetail() {
    wx.showModal({
      title: '确定审批拒绝？',
      confirmColor: '#FF0000',
      complete: (res) => {
        if (res.cancel) {
        }

        if (res.confirm) {
          Toast.loading({
            message: '保存中...',
            forbidClick: true,
            duration: 0,
          });
          wx.cloud
            .callFunction({
              name: 'search',
              data: {
                $url: 'deleteDetail',
                id: this.data.detail._id,
              },
            })
            .then(({ result: res }) => {
              console.log(res);
              if (res.code === 0) {
                Toast.success({
                  message: '审核成功',
                  onClose: () => {
                    setTimeout(() => {
                      this.getDetail(this.data.detail._id);
                    }, 1000);
                  },
                });
              } else {
                Toast.fail(res.msg);
              }
            })
            .catch((e) => {
              Toast.fail('审核失败');
            });
        }
      },
    });
  },
  judgeDetail() {
    wx.showModal({
      title: '确定审批通过？',
      complete: (res) => {
        if (res.cancel) {
        }

        if (res.confirm) {
          Toast.loading({
            message: '保存中...',
            forbidClick: true,
            duration: 0,
          });
          wx.cloud
            .callFunction({
              name: 'search',
              data: {
                $url: 'judgeDetail',
                id: this.data.detail._id,
              },
            })
            .then(({ result: res }) => {
              console.log(res);
              if (res.code === 0) {
                Toast.success({
                  message: '审核成功',
                  onClose: () => {
                    setTimeout(() => {
                      this.getDetail(this.data.detail._id);
                    }, 1000);
                  },
                });
              } else {
                Toast.fail(res.msg);
              }
            })
            .catch((e) => {
              Toast.fail('审核失败');
            });
        }
      },
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);
    this.setData({
      role: app.globalData.userInfo.role || 0,
      isAdmin: app.globalData.userInfo.isAdmin || false,
    });
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
        name: 'search',
        data: {
          $url: 'searchDetail',
          id,
        },
      })
      .then(({ result: res }) => {
        console.log(res);
        if (res.code === 0) {
          Toast.clear();
          // res.data.bornDateTxt = formatTime(res.data.bornDate, 'yyyy/MM/dd');
          let areaTxt = '';
          if (
            ['北京市', '天津市', '上海市', '重庆市'].includes(
              res.data.area[0].name,
            )
          ) {
            areaTxt = res.data.area[0].name + '/' + res.data.area[2].name;
          } else {
            areaTxt = res.data.area.map((d) => d.name).join('/');
          }
          res.data.areaTxt = areaTxt;
          res.data.marryStatusTxt = marryStatusMap[res.data.marryStatus];
          res.data.useWayTxt = useWayMap[res.data.useWay];
          if ([0, 1, 2, 3].includes(res.data.businessScale))
            res.data.businessScaleTxt =
              businessScaleMap[res.data.businessScale];
          res.data.applyStatusTxt = applyStatusMap[res.data.applyStatus];
          // res.data.houseList.forEach((d) => {
          //   let areaTxt = '';
          //   if (
          //     ['北京市', '天津市', '上海市', '重庆市'].includes(d.area[0].name)
          //   ) {
          //     areaTxt = d.area[0].name + '/' + d.area[2].name;
          //   } else {
          //     areaTxt = d.area.map((d) => d.name).join('/');
          //   }
          //   d.areaTxt = areaTxt;
          // });
          res.data.applyDateTxt = formatTime(res.data.applyDate, 'yyyy/MM/dd');
          if (res.data.judgeTime)
            res.data.judgeTimeTxt = formatTime(
              res.data.judgeTime,
              'yyyy/MM/dd hh:mm:ss',
            );
          this.setData({ detail: res.data });
        } else {
          Toast.fail(res.msg);
        }
      })
      .catch((e) => {
        Toast.fail('加载失败');
      });
  },

  onDetailDelete() {
    const { _id: id, username } = this.data.detail;
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
                Toast.success({
                  message: '删除成功',
                  onClose: () => {
                    wx.navigateBack();
                  },
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

  onDetailExport() {
    const { _id: id } = this.data.detail;
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
