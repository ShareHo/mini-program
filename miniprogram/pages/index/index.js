// pages/index/index.js
// const db = wx.cloud.database();
// const collection = db.collection('test-collection');
import {
  isValidityBrithBy15IdCard,
  isTrueValidateCodeBy18IdCard,
  isValidityBrithBy18IdCard,
  dateFormatter,
  validateRealName,
  validatePhone,
} from '../../utils/index';
import Toast from '@vant/weapp/toast/toast';
import { areaList } from '@vant/area-data';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dateFormatter,
    // 日期选择器
    bornPickerShow: false,
    bornDateTxt: '',
    bornMaxDate: new Date().getTime(),
    bornMinDate: new Date('1900/01/01').getTime(),
    // 婚姻状况选择器
    marryShow: false,
    marryColumns: [
      { id: 0, value: '已婚' },
      { id: 1, value: '未婚' },
      { id: 2, value: '离异' },
    ],
    marryStatusTxt: '',
    // 借款用途选择器
    useWayShow: false,
    useWayColumns: [
      { id: 0, value: '生产经营' },
      { id: 1, value: '购买材料' },
      { id: 2, value: '添置设备' },
      { id: 3, value: '扩大经营模式' },
    ],
    useWayTxt: '',
    // 省市区选择器
    areaShow: false,
    areaTxt: '',
    areaList,
    areaShowType: '',
    // 企业规模选择器
    businessScaleShow: false,
    businessScaleColumns: [
      { id: 0, value: '小微型企业' },
      { id: 1, value: '小型企业' },
      { id: 2, value: '中型企业' },
      { id: 3, value: '大型企业' },
    ],
    businessScaleTxt: '',
    // 申请日期
    applyDate: new Date().getTime(),
    applyPickerShow: false,
    applyDateTxt: '',
    // 验证码倒计时
    smsTips: '发送',
    smsTimer: null,
    smsCount: 60,
    // 表单校验文案
    nameMessage: '',
    phoneMessage: '',
    bornDateMessage: '',
    marryStatusMessage: '',
    marrynameMessage: '',
    loanAmountMessage: '',
    useWayMessage: '',
    companyNameMessage: '',
    companyMasterMessage: '',
    areaMessage: '',
    addressMessage: '',
    salaryMessage: '',
    flowingWaterMessage: '',
    annualTurnoverMessage: '',
    equipmentPriceMessage: '',
    businessScaleMessage: '',
    siteAreaMessage: '',
    bankDebtMessage: '',
    creditCardDebtMessage: '',
    applyDateMessage: '',
    smsCodeMessage: '',
    // 表单数据
    username: '',
    phone: '',
    idCard: '',
    idCardMessage: '',
    idCardFront: [],
    idCardBack: [],
    bornDate: new Date('2000/01/01').getTime(),
    marryStatus: '',
    marryname: '',
    loanAmount: '',
    useWay: '',
    useWayMark: '',
    isFamilySupport: true,
    companyName: '',
    companyMaster: '',
    area: [],
    address: '',
    operYears: 0,
    companyMember: 1,
    salary: '',
    flowingWater: '',
    annualTurnover: '',
    isSufficient: true,
    equipmentPrice: '',
    isEquipmentDetain: false,
    businessScale: '',
    sharePercent: 0,
    siteArea: '',
    monthlyRent: '',
    annualIncome: '',
    isInCase: false,
    isIndebt: false,
    bankDebt: '',
    creditCardDebt: '',
    hasHouse: true,
    houseList: [
      {
        isLocal: true,
        area: [],
        areaTxt: '',
        areaMessage: '',
        address: '',
        addressMessage: '',
        totalAmount: '',
        totalAmountMessage: '',
        hasCert: true,
        certFront: [],
        certBack: [],
      },
    ],
    hasCar: true,
    carList: [
      {
        carModel: '',
        carModelMessage: '',
        // carMark: '',
        // carMarkMessage: '',
        totalAmount: '',
        totalAmountMessage: '',
        hasCert: true,
        certFront: [],
        certBack: [],
      },
    ],
    otherMark: '',
    reference: '',
    smsCode: '',
  },

  // 用户名校验
  nameChange(event) {
    const name = event.detail || '';
    const message = validateRealName(name);
    switch (event.target.dataset.nametype) {
      case 'username':
        this.setData({
          nameMessage: message,
          username: name,
        });
        break;
      case 'marryname':
        this.setData({
          marrynameMessage: message,
          marryname: name,
        });
        break;
      case 'companyMaster':
        this.setData({
          companyMasterMessage: message,
          companyMaster: name,
        });
        break;

      default:
        break;
    }
  },

  // 手机号校验
  phoneChange(event) {
    const phone = event.detail || '';
    const message = validatePhone(phone);
    this.setData({
      phoneMessage: message,
      phone: phone,
    });
  },

  // 身份证校验
  idCardChange: function (event) {
    const idCard = event.detail || '';
    let message = '';
    if (idCard.length == 15) {
      if (isValidityBrithBy15IdCard(idCard)) {
        message = '';
      } else {
        message = '您输入的身份证有误';
      }
    } else if (idCard.length == 18) {
      var a_idCard = idCard.split(''); // 得到身份证数组
      if (
        isValidityBrithBy18IdCard(idCard) &&
        isTrueValidateCodeBy18IdCard(a_idCard)
      ) {
        //进行18位身份证的基本验证和第18位的验证
        message = '';
      } else {
        message = '您输入的身份证有误';
      }
    } else {
      if (idCard.length === 0) {
        message = '输入的身份证号不能为空';
      } else {
        message = '您输入的身份证长度有误';
      }
    }
    this.setData({
      idCardMessage: message,
      idCard: idCard,
    });
  },

  // 出生日期
  bornDateConfirm(event) {
    console.log(event);
    const { detail } = event;
    const date = new Date(detail);
    this.setData({
      bornDate: event.detail,
      bornPickerShow: false,
      bornDateTxt: `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()}`,
    });
  },
  bornDateCancel() {
    this.setData({ bornPickerShow: false });
  },
  openBornPicker() {
    this.setData({ bornPickerShow: true });
  },

  // 身份证正面拉取
  async afterIdCardFrontRead(event) {
    this.setData({ idCardFront: [{ ...event.detail.file, isImage: true }] });
    // 同步接口
    try {
      Toast.loading({
        message: '识别中...',
        forbidClick: false,
        duration: 0,
      });
      const fs = wx.getFileSystemManager();
      const base64File = fs.readFileSync(event.detail.file.url, 'base64');
      const { result } = await wx.cloud.callFunction({
        name: 'idcardOcr',
        data: {
          ImageBase64: wx.cloud.CDN(base64File),
          CardSide: 'FRONT',
        },
      });
      if (result.code === 0) {
        console.log(result);
        this.setData({
          username: this.data.username || result.data.Name,
          idCard: this.data.idCard || result.data.IdNum,
          bornDateTxt: this.data.bornDateTxt || result.data.Birth,
          bornDate: this.data.bornDateTxt
            ? this.data.bornDate
            : new Date(result.data.Birth).getTime(),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      Toast.clear();
    }
  },

  // 身份证反面拉取
  afterIdCardBackRead(event) {
    this.setData({ idCardBack: [{ ...event.detail.file, isImage: true }] });
  },

  // 删除身份证
  deleteIdCardBack() {
    this.setData({ idCardBack: [] });
  },
  deleteIdCardFront() {
    this.setData({ idCardFront: [] });
  },

  // 婚姻状况选择
  openMarryPicker() {
    this.setData({ marryShow: true });
  },
  marryConfirm(event) {
    this.setData({
      marryShow: false,
      marryStatus: event.detail.value.id,
      marryStatusTxt: event.detail.value.value,
    });
  },
  marryCancel() {
    this.setData({ marryShow: false });
  },

  // 借款用途
  openUseWayPicker() {
    this.setData({ useWayShow: true });
  },
  useWayCancel() {
    this.setData({ useWayShow: false });
  },
  useWayConfirm(event) {
    this.setData({
      useWayShow: false,
      useWay: event.detail.value.id,
      useWayTxt: event.detail.value.value,
    });
  },
  familySupportChange(event) {
    this.setData({ isFamilySupport: event.detail });
  },
  textChange(event) {
    const name = event.detail || '';
    const type = event.target.dataset.nametype;
    if (type === 'companyName') {
      this.setData({
        companyName: name,
        companyNameMessage: name.trim() ? '' : '公司全称不能为空',
      });
    } else if (type === 'address') {
      this.setData({
        address: name,
        addressMessage: name.trim() ? '' : '详细地址不能为空',
      });
    } else if (type.startsWith('houseList-')) {
      const item = this.data.houseList[type.split('-')[1]];
      item.address = name;
      item.addressMessage = name.trim() ? '' : '详细地址不能为空';
      this.setData({ houseList: this.data.houseList });
    }
  },

  // 省市区
  openAreaPicker(event) {
    const { areaShowType } = event.target.dataset;
    this.setData({ areaShow: true, areaShowType });
  },
  areaCancel() {
    this.setData({ areaShow: false });
  },
  areaConfirm(event) {
    const area = event.detail.values;
    let areaTxt = '';
    if (['北京市', '天津市', '上海市', '重庆市'].includes(area[0].name)) {
      areaTxt = area[0].name + '/' + area[2].name;
    } else {
      areaTxt = area.map((d) => d.name).join('/');
    }
    if (this.data.areaShowType === 'address') {
      this.setData({
        area,
        areaTxt,
        areaShow: false,
      });
    } else if (this.data.areaShowType.startsWith('houseList-')) {
      const item = this.data.houseList[this.data.areaShowType.split('-')[1]];
      item.area = area;
      item.areaTxt = areaTxt;
      this.setData({ areaShow: false, houseList: this.data.houseList });
    }
  },
  // 经营年限
  operYearsChange(event) {
    this.setData({ operYears: event.detail || 0 });
  },
  // 员工人数
  companyMemberChange(event) {
    this.setData({ companyMember: event.detail || 1 });
  },
  // 金额校验
  amountChange(event) {
    const amount = event.detail || '';
    const type = event.target.dataset.amounttype;
    let message = '';
    if (+amount > 0) {
      message = '';
    } else if (amount === 0) {
      message = '金额不能为0';
    } else {
      message = '您输入的金额有误';
    }
    if (type.startsWith('houseList-')) {
      const item = this.data.houseList[type.split('-')[1]];
      item.totalAmount = amount;
      item.totalAmountMessage = message;
      this.setData({ houseList: this.data.houseList });
    } else if (type.startsWith('carList-')) {
      const item = this.data.carList[type.split('-')[1]];
      item.totalAmount = amount;
      item.totalAmountMessage = message;
      this.setData({ carList: this.data.carList });
    } else {
      this.setData({ [type]: amount });
      switch (type) {
        case 'loanAmount':
          this.setData({ loanAmountMessage: message });
          break;
        case 'salary':
          this.setData({ salaryMessage: message });
          break;
        case 'flowingWater':
          this.setData({ flowingWaterMessage: message });
          break;
        case 'annualTurnover':
          this.setData({ annualTurnoverMessage: message });
          break;
        case 'equipmentPrice':
          this.setData({ equipmentPriceMessage: '' });
          break;
        case 'siteArea':
          this.setData({ siteAreaMessage: message ? '场地面积必须大于0' : '' });
          break;
        case 'bankDebt':
          this.setData({ bankDebtMessage: message });
          break;
        case 'creditCardDebt':
          this.setData({ creditCardDebtMessage: message });
          break;

        default:
          break;
      }
    }
  },
  sufficientChange(event) {
    this.setData({ isSufficient: event.detail });
  },
  equipmentDetainChange(event) {
    this.setData({ isEquipmentDetain: event.detail });
  },

  // 企业规模
  openbusinessScalePicker() {
    this.setData({ businessScaleShow: true });
  },
  businessScaleCancel() {
    this.setData({ businessScaleShow: false });
  },
  businessScaleConfirm(event) {
    this.setData({
      businessScaleShow: false,
      businessScale: event.detail.value.id,
      businessScaleTxt: event.detail.value.value,
    });
  },
  // 占股百分比
  sharePercentChange(event) {
    this.setData({ sharePercent: event.detail || 0 });
  },
  monthlyRentChange(event) {
    const amount = event.detail || '';
    this.setData({ monthlyRent: amount });
  },
  annualIncomeChange(event) {
    const amount = event.detail || '';
    this.setData({ annualIncome: amount });
  },
  inCaseChange(event) {
    this.setData({ isInCase: event.detail });
  },
  indebtChange(event) {
    this.setData({ isIndebt: event.detail });
  },
  hasHouseChange(event) {
    this.setData({ hasHouse: event.detail });
  },
  // 添加房产
  addHouse() {
    const house = {
      isLocal: true,
      area: [],
      areaTxt: '',
      areaMessage: '',
      address: '',
      addressMessage: '',
      totalAmount: '',
      totalAmountMessage: '',
      hasCert: true,
      certFront: [],
      certBack: [],
    };
    this.setData({ houseList: [...this.data.houseList, house] });
  },
  localChange(event) {
    const item = this.data.houseList[event.target.dataset.houseIndex];
    item.isLocal = event.detail;
  },
  hasCertChange(event) {
    const index = event.target.dataset.houseIndex;
    const item = this.data.houseList[index];
    item.hasCert = event.detail;
    this.setData({ houseList: this.data.houseList });
  },
  afterCertRead(event) {
    const index = event.target.dataset.houseIndex;
    const item = this.data.houseList[index.split('-')[1]];
    item[index.split('-')[0]] = [{ ...event.detail.file, isImage: true }];
    this.setData({ houseList: this.data.houseList });
  },
  deleteCert(event) {
    const index = event.target.dataset.houseIndex;
    const item = this.data.houseList[index.split('-')[1]];
    item[index.split('-')[0]] = [];
    this.setData({ houseList: this.data.houseList });
  },
  deleteHouse(event) {
    const index = event.target.dataset.houseIndex;
    wx.showModal({
      title: `确定删除房产${index + 1}？`,
    }).then((res) => {
      if (res.confirm) {
        this.data.houseList.splice(index, 1);
        this.setData({ houseList: this.data.houseList });
      }
    });
  },

  hasCarChange(event) {
    this.setData({ hasCar: event.detail });
  },
  addCar() {
    const car = {
      carModel: '',
      carModelMessage: '',
      // carMark: '',
      // carMarkMessage: '',
      totalAmount: '',
      totalAmountMessage: '',
      hasCert: true,
      certFront: [],
      certBack: [],
    };
    this.setData({ carList: [...this.data.carList, car] });
  },
  carChange(event) {
    const name = event.detail || '';
    const carIndex = event.target.dataset.carIndex.split('-');
    const item = this.data.carList[carIndex[1]];
    // if (carIndex[0] === 'carBrand') {
    item.carModel = name;
    item.carModelMessage = name.trim() ? '' : '品牌型号不能为空';
    // }
    // else if (carIndex[0] === 'carMark') {
    //   item.carMark = name;
    //   item.carMarkMessage = name.trim() ? '' : '车辆型号不能为空';
    // }
    this.setData({ carList: this.data.carList });
  },
  hasCarCertChange(event) {
    const index = event.target.dataset.carIndex;
    const item = this.data.carList[index];
    item.hasCert = event.detail;
    this.setData({ carList: this.data.carList });
  },
  async afterCarCertRead(event) {
    // vehicleLicenseOcr
    const index = event.target.dataset.carIndex.split('-');
    const item = this.data.carList[index[1]];
    item[index[0]] = [{ ...event.detail.file, isImage: true }];
    this.setData({ carList: this.data.carList });
    if (index[0] === 'certFront') {
      // 同步接口
      try {
        Toast.loading({
          message: '识别中...',
          forbidClick: false,
          duration: 0,
        });
        const fs = wx.getFileSystemManager();
        const base64File = fs.readFileSync(event.detail.file.url, 'base64');
        const { result } = await wx.cloud.callFunction({
          name: 'vehicleLicenseOcr',
          data: {
            ImageBase64: wx.cloud.CDN(base64File),
            CardSide: 'FRONT',
          },
        });
        if (result.code === 0) {
          item.carModel = item.carModel || result.data.FrontInfo.Model;
          this.setData({ carList: this.data.carList });
        }
      } catch (e) {
        console.error(e);
      } finally {
        Toast.clear();
      }
    }
  },
  deleteCarCert(event) {
    const index = event.target.dataset.carIndex;
    const item = this.data.carList[index.split('-')[1]];
    item[index.split('-')[0]] = [];
    this.setData({ carList: this.data.carList });
  },
  deleteCar(event) {
    const index = event.target.dataset.carIndex;
    wx.showModal({
      title: `确定删除车辆${index + 1}？`,
    }).then((res) => {
      if (res.confirm) {
        this.data.carList.splice(index, 1);
        this.setData({ carList: this.data.carList });
      }
    });
  },
  // 出生日期
  applyDateConfirm(event) {
    console.log(event);
    const { detail } = event;
    const date = new Date(detail);
    this.setData({
      applyDate: event.detail,
      applyPickerShow: false,
      applyDateTxt: `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()}`,
    });
  },
  applyDateCancel() {
    this.setData({ applyPickerShow: false });
  },
  openApplyPicker() {
    this.setData({ applyPickerShow: true });
  },
  async sendSmsCode() {
    if (this.data.smsTimer) return;
    const phoneMessage = validatePhone(this.data.phone);
    if (phoneMessage) {
      Toast('请检查手机号码是否正确');
      this.setData({ phoneMessage }, () => {
        wx.pageScrollTo({ selector: '#phone' });
      });
      return;
    }
    Toast.loading({
      message: '发送中...',
      forbidClick: true,
      duration: 0,
    });
    const { result: res } = await wx.cloud.callFunction({
      name: 'sendSms',
      data: { phone: this.data.phone, test: true },
    });
    if (res.code === 0) {
      Toast.clear();
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
      Toast(res.msg);
    }
  },
  smsCodeChange(event) {
    const smsCode = event.detail || '';
    let message = '';
    if (smsCode) {
      if (/^\d{6}$/.test(smsCode)) {
        message = '';
      } else {
        message = '您输入的验证码格式有误';
      }
    } else {
      message = '验证码不能为空';
    }
    this.setData({
      smsCode,
      smsCodeMessage: message,
    });
  },

  handleApply() {
    const wrongSelector = [];
    const nameMessage = validateRealName(this.data.username);
    if (nameMessage) {
      wrongSelector.push('#username');
      this.setData({ nameMessage });
    }
    if (wrongSelector.length) {
      wx.pageScrollTo({ selector: wrongSelector[0] });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

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
