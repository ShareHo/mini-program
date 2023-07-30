const app = getApp();
import { validatePhone, validateSmsCode } from '../../utils/index';
import Toast from '@vant/weapp/toast/toast';
import { isTest } from '../../utils/env';
const fs = wx.getFileSystemManager();

Page({
  data: {
    avatarUrl: '',
    nickname: '',
    phone: '',
    phoneMessage: '',
    originPhone: '',
    smsCode: '',
    smsCodeMessage: '',
    // 验证码倒计时
    smsTips: '发送',
    smsTimer: null,
    smsCount: 60,
  },
  onLoad() {
    // const eventChannel = this.getOpenerEventChannel();
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    // eventChannel.on('acceptDataFromOpenerPage', (data) => {
    //   console.log(data);
    //   this.setData({ ...data, originPhone: data.phone });
    // });
    if (app.globalData.loadingStatus === 2 && app.globalData.userInfo.phone) {
      if (app.globalData.userInfo.phone !== this.data.phone) {
        this.setData({
          phone: app.globalData.userInfo.phone,
          originPhone: app.globalData.userInfo.phone,
        });
      }
      if (app.globalData.userInfo.nickname !== this.data.nickname) {
        this.setData({ nickname: app.globalData.userInfo.nickname });
      }
      if (app.globalData.userInfo.avatarUrl !== this.data.avatarUrl) {
        this.setData({ avatarUrl: app.globalData.userInfo.avatarUrl });
      }
    }
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({ avatarUrl });
  },
  nicknameChange(e) {
    console.log(e);
    this.setData({ nickname: e.detail });
  },
  // 手机号校验
  phoneChange(event) {
    const phone = event.detail || '';
    const phoneMessage = validatePhone(phone);
    this.setData({ phone, phoneMessage });
  },
  smsCodeChange(event) {
    const smsCode = event.detail || '';
    const smsCodeMessage = validateSmsCode(smsCode);
    this.setData({ smsCode, smsCodeMessage });
  },
  async sendSmsCode() {
    if (this.data.smsTimer) return;
    const phoneMessage = validatePhone(this.data.phone);
    if (phoneMessage) {
      Toast.fail('请检查手机号码是否正确');
      return;
    }
    try {
      Toast.loading({
        message: '发送中...',
        forbidClick: true,
        duration: 0,
      });
      const { result: res } = await wx.cloud.callFunction({
        name: 'sendSms',
        data: { phone: this.data.phone, test: isTest },
      });
      if (res.code === 0) {
        Toast.clear();
        if (isTest) {
          this.setData({ smsCode: res.data, smsCodeMessage: '' });
          return;
        }
        this.setData({ smsTips: this.data.smsCount + 's' });
        this.data.smsTimer = setInterval(() => {
          this.data.smsCount -= 1;
          if (this.data.smsCount <= 0) {
            clearInterval(this.data.smsTimer);
            this.data.smsTimer = null;
            this.data.smsCount = 60;
            this.setData({ smsTips: '发送' });
          } else {
            this.setData({ smsTips: this.data.smsCount + 's' });
          }
        }, 1000);
      } else {
        Toast.fail(res.msg);
      }
    } catch (e) {
      Toast.fail('请求错误，请稍后重试');
    }
  },
  async handleSave(e) {
    const eventChannel = this.getOpenerEventChannel();
    // const data = {};
    const { avatarUrl, phone, originPhone, smsCode } = this.data;
    const nickname = e.detail.value.nickname;
    const params = {
      phone,
      avatarUrl,
      nickname,
    };
    // if (avatarUrl) data.avatarUrl = avatarUrl;
    // if (nickname) data.nickname = nickname;
    const phoneMessage = validatePhone(this.data.phone);
    if (!originPhone || phone !== originPhone) {
      if (phoneMessage) {
        Toast.fail('请检查手机号码是否正确');
        return;
      }
      const smsCodeMessage = validateSmsCode(this.data.smsCode);
      if (smsCodeMessage) {
        Toast.fail('请检查验证码是否正确');
        return;
      }
      // data.phone = phone;
      params.smsCode = smsCode;
    }
    // console.log(nickname);
    // console.log(this.selectComponent('.mine-nickname'));
    // console.log();
    // return;
    Toast.loading({
      message: '正在保存...',
      forbidClick: true,
      duration: 0,
    });
    try {
      const { result: res } = await wx.cloud.callFunction({
        name: 'user',
        data: {
          $url: 'setUser',
          ...params,
          avatarUrl:
            avatarUrl !== app.globalData.userInfo.avatarUrl && avatarUrl
              ? wx.cloud.CDN(fs.readFileSync(avatarUrl))
              : avatarUrl,
        },
      });
      if (res.code === 0) {
        Toast.success({
          message: '保存成功',
          onClose() {
            wx.navigateBack();
          },
        });
        Object.assign(app.globalData.userInfo, res.data);
        eventChannel.emit('setPhone', { phone: res.data.phone });
      } else {
        Toast.fail(res.msg);
      }
    } catch (e) {
      console.log(e);
      Toast.fail('保存失败');
    }
  },
});
