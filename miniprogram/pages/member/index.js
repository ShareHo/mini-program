// pages/member/index.js
import Toast from '@vant/weapp/toast/toast';
import { formatTime } from '../../utils/index';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    referenceCode: '',
    nickname: '',
    roleTxt: '',
    selectRole: '',
    rolePickerShow: false,
    roleShowType: '',
    page: 1,
    size: 10,
    total: 0,
    memberList: [],
    selectMemberIndex: 0,
    roleColumns: [
      { id: 0, value: '普通用户' },
      { id: 1, value: '管理员' },
      { id: 2, value: '业务员' },
      { id: 3, value: '风控' },
    ],
    roleMap: {
      0: '普通用户',
      1: '管理员',
      2: '业务员',
      3: '风控',
    },
  },
  // 角色
  openRolePicker(event) {
    const { roleShowType, index, role } = event.target.dataset;
    console.log(role);
    let roleColumns = [];
    if (roleShowType === 'search') {
      roleColumns = [
        { id: 1, value: '管理员' },
        { id: 2, value: '业务员' },
        { id: 3, value: '风控' },
      ];
      this.setData({ selectRole: role });
    } else {
      roleColumns = [
        { id: 0, value: '普通用户' },
        { id: 1, value: '管理员' },
        { id: 2, value: '业务员' },
        { id: 3, value: '风控' },
      ];
      this.setData({ listSelectRole: role });
    }
    this.setData(
      {
        rolePickerShow: true,
        selectMemberIndex: index,
        roleColumns,
        roleShowType,
      },
      () => {
        if (roleShowType === 'search') {
          this.selectComponent('.rolePicker').setColumnIndex(
            0,
            (role || 1) - 1,
          );
        } else {
          this.selectComponent('.rolePicker').setColumnIndex(0, role);
        }
      },
    );
  },
  rolePickerClose() {
    this.setData({ rolePickerShow: false });
  },
  rolePickerConfirm(e) {
    const selectRole = e.detail.value.id;
    const roleTxt = e.detail.value.value;
    console.log(selectRole);
    if (this.data.roleShowType === 'search') {
      this.setData({
        roleTxt,
        rolePickerShow: false,
      });
    } else {
      // console.log(this.data.selectMemberIndex);
      if (selectRole === this.data.listSelectRole) {
        this.setData({ rolePickerShow: false });
        return;
      }
      wx.showModal({
        title: `确定变更为${this.data.roleMap[selectRole]}？`,
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
                  $url: 'setRole',
                  id: this.data.memberList[this.data.selectMemberIndex]._id,
                  role: selectRole,
                },
              })
              .then(({ result: res }) => {
                console.log(res);
                if (res.code === 0) {
                  Toast.success({
                    message: '变更成功',
                    onClose: () => {
                      setTimeout(() => {
                        this.setData({ page: 1 });
                        this.getData().then(() => {
                          wx.stopPullDownRefresh();
                        });
                      }, 300);
                    },
                  });
                  this.rolePickerClose();
                } else {
                  Toast.fail(res.msg);
                }
              })
              .catch((e) => {
                Toast.fail('变更失败');
              });
          }
        },
      });
    }
  },

  onReset() {
    this.setData({
      phone: '',
      referenceCode: '',
      nickname: '',
      roleTxt: '',
      selectRole: '',
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
          $url: 'memberList',
          page: this.data.page,
          size: this.data.size,
          phone: this.data.phone,
          referenceCode: this.data.referenceCode,
          nickname: this.data.nickname,
          role: this.data.selectRole,
        },
      });
      console.log(res);
      if (res.code === 0) {
        Toast.clear();
        this.setData({
          total: res.total,
          memberList:
            this.data.page === 1
              ? res.data
              : this.data.memberList.concat(res.data),
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
