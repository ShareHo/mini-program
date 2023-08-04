// pages/index/index.js
// const db = wx.cloud.database();
// const collection = db.collection('test-collection');
import {
  dateFormatter,
  validateRealName,
  validatePhone,
  validateIdCard,
  validateAmount,
  validateNumber,
  validateSmsCode,
} from '../../utils/index';
import Toast from '@vant/weapp/toast/toast';
import { areaList } from '@vant/area-data';
import { isTest, isOnline, reviewCode } from '../../utils/env';

const date = new Date();
const app = getApp();
// const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    reviewApiLoaded: false,
    isReview: true,
    dateFormatter,
    // 日期选择器
    bornPickerShow: false,
    bornDateTxt: '',
    bornMaxDate: date.getTime(),
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
    applyPickerShow: false,
    applyDateTxt: `${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}`,
    // 验证码倒计时
    smsTips: '发送',
    smsTimer: null,
    smsCount: 60,
    // 表单校验文案
    nameMessage: '',
    phoneMessage: '',
    idCardMessage: '',
    bornDateMessage: '',
    marryStatusMessage: '',
    marrynameMessage: '',
    loanAmountMessage: '',
    useWayMessage: '',
    companyNameMessage: '',
    companyMasterMessage: '',
    companyRecCodeMessage: '',
    areaMessage: '',
    addressMessage: '',
    salaryMessage: '',
    flowingWaterMessage: '',
    annualTurnoverMessage: '',
    equipmentPriceMessage: '',
    businessScaleMessage: '',
    siteAreaMessage: '',
    monthlyRentMessage: '',
    annualIncomeMessage: '',
    bankDebtMessage: '',
    creditCardDebtMessage: '',
    applyDateMessage: '',
    smsCodeMessage: '',
    // 表单数据
    username: '',
    phone: '',
    idCard: '',
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
    companyRecCode: '',
    bizLicense: [],
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
    isInDebt: false,
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
    applyDate: date.getTime(),
    smsCode: '',
    originPhone: '',
  },

  // 用户名校验
  nameChange(event) {
    const name = event.detail || '';
    let message = '';
    switch (event.target.dataset.nametype) {
      case 'username':
        message = validateRealName(name, '姓名');
        this.setData({
          nameMessage: message,
          username: name,
        });
        break;
      case 'marryname':
        message = validateRealName(name, '配偶姓名');
        this.setData({
          marrynameMessage: message,
          marryname: name,
        });
        break;
      case 'companyMaster':
        message = validateRealName(name, '公司法人');
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
    const phoneMessage = validatePhone(phone);
    this.setData({ phone, phoneMessage });
  },

  // 身份证校验
  idCardChange: function (event) {
    const idCard = event.detail || '';
    const idCardMessage = validateIdCard(idCard);
    this.setData({ idCardMessage, idCard });
  },

  // 出生日期
  bornDateConfirm(event) {
    // console.log(event);
    const { detail } = event;
    const date = new Date(detail);
    this.setData({
      bornDate: event.detail,
      bornPickerShow: false,
      bornDateTxt: `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()}`,
      bornDateMessage: '',
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
      // const base64File = fs.readFileSync(event.detail.file.tempFilePath, 'base64');
      const arrayBufferFile = fs.readFileSync(event.detail.file.tempFilePath);
      const { result } = await wx.cloud.callFunction({
        name: 'ocrApi',
        data: {
          $url: 'idCard',
          test: isTest,
          ImageType: event.detail.file.tempFilePath.split('.').pop(),
          ImageBuffer: wx.cloud.CDN(arrayBufferFile),
          // ImageBase64: wx.cloud.CDN(base64File),
          CardSide: 'FRONT',
        },
      });
      if (result.code === 0) {
        // console.log(result);
        this.setData({
          username: result.data.Name,
          idCard: result.data.IdNum,
          bornDateTxt: result.data.Birth,
          bornDate: new Date(result.data.Birth).getTime(),
          nameMessage: '',
          idCardMessage: '',
          bornDateMessage: '',
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

  // 营业执照拉取
  async afterBizLicenseRead(event) {
    this.setData({ bizLicense: [{ ...event.detail.file, isImage: true }] });
    // 同步接口
    try {
      Toast.loading({
        message: '识别中...',
        forbidClick: false,
        duration: 0,
      });
      const fs = wx.getFileSystemManager();
      const arrayBufferFile = fs.readFileSync(event.detail.file.tempFilePath);
      const { result } = await wx.cloud.callFunction({
        name: 'ocrApi',
        data: {
          $url: 'bizLicense',
          test: isTest,
          ImageType: event.detail.file.tempFilePath.split('.').pop(),
          ImageBuffer: wx.cloud.CDN(arrayBufferFile),
        },
      });
      if (result.code === 0) {
        console.log(result);
        this.setData({
          companyRecCode: result.data.RegNum,
          companyMaster: result.data.Person,
          companyName: result.data.Name,
          companyNameMessage: '',
          companyMasterMessage: '',
          companyRecCodeMessage: '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      Toast.clear();
    }
  },
  // 删除营业执照
  deleteBizLicense() {
    this.setData({ bizLicense: [] });
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
      marryStatusMessage: '',
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
      useWayMessage: '',
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
        areaMessage: '',
      });
    } else if (this.data.areaShowType.startsWith('houseList-')) {
      const item = this.data.houseList[this.data.areaShowType.split('-')[1]];
      item.area = area;
      item.areaTxt = areaTxt;
      item.areaMessage = '';
      this.setData({ areaShow: false, houseList: this.data.houseList });
    }
  },
  // 经营年限
  operYearsChange(event) {
    console.log(event.detail);
    // || !event.detail.endsWith('.')
    if (typeof event.detail === 'number')
      this.setData({ operYears: event.detail || 0 });
  },
  // 员工人数
  companyMemberChange(event) {
    this.setData({ companyMember: event.detail || 1 });
  },
  // 金额校验
  amountChange(event) {
    const amount = event.detail || '';
    let message = '';
    const type = event.target.dataset.amounttype;
    if (type.startsWith('houseList-')) {
      const item = this.data.houseList[type.split('-')[1]];
      message = validateAmount(amount);
      item.totalAmount = amount;
      item.totalAmountMessage = message;
      this.setData({ houseList: this.data.houseList });
    } else if (type.startsWith('carList-')) {
      const item = this.data.carList[type.split('-')[1]];
      message = validateAmount(amount);
      item.totalAmount = amount;
      item.totalAmountMessage = message;
      this.setData({ carList: this.data.carList });
    } else {
      this.setData({ [type]: amount });
      switch (type) {
        case 'loanAmount':
          message = validateAmount(amount);
          this.setData({ loanAmountMessage: message });
          break;
        case 'salary':
          message = validateNumber(amount);
          this.setData({ salaryMessage: message });
          break;
        case 'flowingWater':
          message = validateNumber(amount);
          this.setData({ flowingWaterMessage: message });
          break;
        case 'annualTurnover':
          message = validateNumber(amount);
          this.setData({ annualTurnoverMessage: message });
          break;
        case 'equipmentPrice':
          message = validateNumber(amount);
          this.setData({ equipmentPriceMessage: message });
          break;
        case 'siteArea':
          message = validateNumber(amount, '场地面积');
          this.setData({ siteAreaMessage: message });
          break;
        case 'annualIncome':
          message = validateNumber(amount);
          this.setData({ annualIncomeMessage: message });
          break;
        case 'bankDebt':
          message = validateNumber(amount);
          this.setData({ bankDebtMessage: message });
          break;
        case 'creditCardDebt':
          message = validateNumber(amount);
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
      businessScaleMessage: '',
    });
  },
  // 占股百分比
  sharePercentChange(event) {
    console.log(event.detail);
    // || !event.detail.endsWith('.')
    if (typeof event.detail === 'number')
      this.setData({ sharePercent: event.detail || 0 });
  },
  monthlyRentChange(event) {
    const amount = event.detail || '';
    const monthlyRentMessage = validateNumber(amount, '金额');
    this.setData({ monthlyRent: amount, monthlyRentMessage });
  },
  // annualIncomeChange(event) {
  //   const amount = event.detail || '';
  //   this.setData({ annualIncome: amount });
  // },
  inCaseChange(event) {
    this.setData({ isInCase: event.detail });
  },
  indebtChange(event) {
    this.setData({ isInDebt: event.detail });
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
        // const base64File = fs.readFileSync(event.detail.file.tempFilePath, 'base64');
        const arrayBufferFile = fs.readFileSync(event.detail.file.tempFilePath);
        const { result } = await wx.cloud.callFunction({
          name: 'ocrApi',
          data: {
            $url: 'vehicleLicense',
            test: isTest,
            ImageType: event.detail.file.tempFilePath.split('.').pop(),
            ImageBuffer: wx.cloud.CDN(arrayBufferFile),
            // ImageBase64: wx.cloud.CDN(base64File),
            CardSide: 'FRONT',
          },
        });
        if (result.code === 0) {
          item.carModel = result.data.FrontInfo.Model;
          item.carModelMessage = '';
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
    const { detail } = event;
    const date = new Date(detail);
    this.setData({
      applyDate: event.detail,
      applyPickerShow: false,
      applyDateTxt: `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()}`,
      applyDateMessage: '',
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
      Toast.fail('请检查手机号码是否正确');
      this.setData({ phoneMessage }, () => {
        wx.pageScrollTo({ selector: '#phone' });
      });
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
  smsCodeChange(event) {
    const smsCode = event.detail || '';
    const smsCodeMessage = validateSmsCode(smsCode);
    this.setData({ smsCode, smsCodeMessage });
  },

  async handleApply() {
    // try {
    //   Toast.loading({
    //     message: '正在提交...',
    //     forbidClick: false,
    //     duration: 0,
    //   });
    //   const fs = wx.getFileSystemManager();
    //   const { result: res } = await wx.cloud.callFunction({
    //     name: 'apply',
    //     data: {
    //       idCardFront: wx.cloud.CDN(
    //         fs.readFileSync(this.data.idCardBack[0].tempFilePath),
    //       ),
    //     },
    //   });
    //   if (res.code === 0) {
    //     Toast.success('提交成功');
    //   } else {
    //     Toast.fail(res.msg);
    //   }
    // } catch (e) {
    //   Toast.fail('请求错误，请稍后重试');
    // }
    const wrongSelector = [];
    const messageData = {};
    // 姓名
    const nameMessage = validateRealName(this.data.username, '姓名');
    if (nameMessage) {
      wrongSelector.push('#userinfo');
      messageData.nameMessage = nameMessage;
    }
    // 手机号
    const phoneMessage = validatePhone(this.data.phone);
    if (phoneMessage) {
      wrongSelector.push('#phone');
      messageData.phoneMessage = phoneMessage;
    }
    // 身份证
    const idCardMessage = validateIdCard(this.data.idCard);
    if (idCardMessage) {
      wrongSelector.push('#idcard');
      messageData.idCardMessage = idCardMessage;
    }
    // 出生日期
    if (!this.data.bornDateTxt) {
      wrongSelector.push('#bornDate');
      messageData.bornDateMessage = '出生日期不能为空';
    }
    // 家庭住址省市区
    if (!this.data.areaTxt) {
      wrongSelector.push('#areaList');
      messageData.areaMessage = '省市区不能为空';
    }
    // 详细地址
    if (!this.data.address.trim()) {
      wrongSelector.push('#address');
      messageData.addressMessage = '详细地址不能为空';
    }
    // 婚姻状况
    if (!this.data.marryStatusTxt) {
      wrongSelector.push('#marryStatus');
      messageData.marryStatusMessage = '婚姻状况不能为空';
    }
    // 配偶姓名身份证
    const marrynameMessage = validateRealName(this.data.marryname, '配偶姓名');
    if (this.data.marryStatus === 0 && marrynameMessage) {
      wrongSelector.push('#marryname');
      messageData.marrynameMessage = marrynameMessage;
    }
    // 上传身份证
    if (
      this.data.idCardFront.length === 0 ||
      this.data.idCardBack.length === 0
    ) {
      wrongSelector.push('#idcardCamera');
    }
    // 申请额度
    const loanAmountMessage = validateAmount(this.data.loanAmount);
    if (loanAmountMessage) {
      wrongSelector.push('#loanAmount');
      messageData.loanAmountMessage = loanAmountMessage;
    }
    // 借款用途
    if (!this.data.useWayTxt) {
      wrongSelector.push('#useWay');
      messageData.useWayMessage = '借款用途不能为空';
    }
    // 公司全称
    if (!this.data.companyName.trim()) {
      wrongSelector.push('#companyName');
      messageData.companyNameMessage = '公司全称不能为空';
    }
    // 公司法人
    const companyMasterMessage = validateRealName(
      this.data.companyMaster,
      '公司法人',
    );
    if (companyMasterMessage) {
      wrongSelector.push('#companyMaster');
      messageData.companyMasterMessage = companyMasterMessage;
    }
    // 上传营业执照
    if (this.data.bizLicense.length === 0) {
      wrongSelector.push('#bizLicense');
    }
    // 员工工资
    const salaryMessage = validateNumber(this.data.salary);
    if (salaryMessage) {
      wrongSelector.push('#salary');
      messageData.salaryMessage = salaryMessage;
    }
    // 员工流水
    const flowingWaterMessage = validateNumber(this.data.flowingWater);
    if (flowingWaterMessage) {
      wrongSelector.push('#flowingWater');
      messageData.flowingWaterMessage = flowingWaterMessage;
    }
    // 年营业额
    const annualTurnoverMessage = validateNumber(this.data.annualTurnover);
    if (annualTurnoverMessage) {
      wrongSelector.push('#annualTurnover');
      messageData.annualTurnoverMessage = annualTurnoverMessage;
    }
    // 设备价值
    const equipmentPriceMessage = validateNumber(this.data.equipmentPrice);
    if (equipmentPriceMessage) {
      wrongSelector.push('#equipmentPrice');
      messageData.equipmentPriceMessage = equipmentPriceMessage;
    }
    // 企业规模
    if (!this.data.businessScaleTxt) {
      wrongSelector.push('#businessScale');
      messageData.businessScaleMessage = '企业规模不能为空';
    }
    // 场地面积
    const siteAreaMessage = validateNumber(this.data.siteArea, '场地面积');
    if (siteAreaMessage) {
      wrongSelector.push('#siteArea');
      messageData.siteAreaMessage = '场地面积必须大于0';
    }
    // 场地月缴租金
    const monthlyRentMessage = validateNumber(this.data.monthlyRent, '金额');
    if (monthlyRentMessage) {
      wrongSelector.push('#monthlyRent');
      messageData.monthlyRentMessage = monthlyRentMessage;
    }
    // 年收入金额
    const annualIncomeMessage = validateNumber(this.data.annualIncome, '金额');
    if (annualIncomeMessage) {
      wrongSelector.push('#annualIncome');
      messageData.annualIncomeMessage = annualIncomeMessage;
    }
    // 银行总贷款额度
    const bankDebtMessage = validateNumber(this.data.bankDebt, '金额');
    if (bankDebtMessage) {
      wrongSelector.push('#bankDebt');
      messageData.bankDebtMessage = bankDebtMessage;
    }
    // 信用卡总额度
    const creditCardDebtMessage = validateNumber(
      this.data.creditCardDebt,
      '金额',
    );
    if (creditCardDebtMessage) {
      wrongSelector.push('#creditCardDebt');
      messageData.creditCardDebtMessage = creditCardDebtMessage;
    }
    // 房产判断
    if (this.data.hasHouse) {
      this.data.houseList.forEach((d, i) => {
        let wrong = false;
        // 家庭住址省市区
        if (!d.areaTxt) {
          wrong = true;
          d.areaMessage = '省市区不能为空';
        }
        // 详细地址
        if (!d.address.trim()) {
          wrong = true;
          d.addressMessage = '详细地址不能为空';
        }
        // 全款、按揭金额
        const totalAmountMessage = validateAmount(d.totalAmount, '金额');
        if (totalAmountMessage) {
          wrong = true;
          d.totalAmountMessage = totalAmountMessage;
        }
        if (wrong) wrongSelector.push(`#house-item-${i}`);
        // 房产证上传
        if (
          d.hasCert &&
          (d.certFront.length === 0 || d.certBack.length === 0)
        ) {
          wrongSelector.push(`#house-cert-${i}`);
        }
      });
      messageData.houseList = this.data.houseList;
    }
    // 车产判断
    if (this.data.hasCar) {
      this.data.carList.forEach((d, i) => {
        let wrong = false;
        // 品牌型号
        if (!d.carModel) {
          wrong = true;
          d.carModelMessage = '品牌型号不能为空';
        }
        // 全款、按揭金额
        const totalAmountMessage = validateAmount(d.totalAmount, '金额');
        if (totalAmountMessage) {
          wrong = true;
          d.totalAmountMessage = totalAmountMessage;
        }
        if (wrong) wrongSelector.push(`#car-item-${i}`);
        // 行驶证上传
        if (
          d.hasCert &&
          (d.certFront.length === 0 || d.certBack.length === 0)
        ) {
          wrongSelector.push(`#car-cert-${i}`);
        }
      });
      messageData.carList = this.data.carList;
    }
    // 填表日期
    if (!this.data.applyDateTxt) {
      wrongSelector.push('#applyDate');
      messageData.bornDateMessage = '填表日期不能为空';
    }
    // 填表日期
    if (this.data.phone !== this.data.originPhone) {
      const smsCodeMessage = validateSmsCode(this.data.smsCode);
      if (smsCodeMessage) {
        wrongSelector.push('#smsCode');
        messageData.smsCodeMessage = smsCodeMessage;
      }
    }

    if (wrongSelector.length) {
      this.setData(messageData, () => {
        // 定位完善输入
        wx.pageScrollTo({ selector: wrongSelector[0] });
        switch (true) {
          case wrongSelector[0] === '#idcardCamera':
            Toast.fail('请上传身份证');
            break;
          case wrongSelector[0] === '#bizLicense':
            Toast.fail('请上传营业执照');
            break;
          case wrongSelector[0].startsWith('#house-cert-'):
            Toast.fail('请上传房产证');
            break;
          case wrongSelector[0].startsWith('#car-cert-'):
            Toast.fail('请上传行驶证');
            break;

          default:
            break;
        }
      });
    } else {
      const fs = wx.getFileSystemManager();
      const params = {
        username: this.data.username,
        phone: this.data.phone,
        idCard: this.data.idCard,
        idCardFront: wx.cloud.CDN(
          fs.readFileSync(this.data.idCardFront[0].tempFilePath),
        ),
        idCardBack: wx.cloud.CDN(
          fs.readFileSync(this.data.idCardBack[0].tempFilePath),
        ),
        bornDate: this.data.bornDate,
        marryStatus: this.data.marryStatus,
        loanAmount: this.data.loanAmount,
        useWay: this.data.useWay,
        useWayMark: this.data.useWayMark,
        isFamilySupport: this.data.isFamilySupport,
        companyName: this.data.companyName,
        companyMaster: this.data.companyMaster,
        companyRecCode: this.data.companyRecCode,
        bizLicense: wx.cloud.CDN(
          fs.readFileSync(this.data.bizLicense[0].tempFilePath),
        ),
        area: this.data.area,
        address: this.data.address,
        operYears: this.data.operYears,
        companyMember: this.data.companyMember,
        salary: this.data.salary,
        flowingWater: this.data.flowingWater,
        annualTurnover: this.data.annualTurnover,
        isSufficient: this.data.isSufficient,
        equipmentPrice: this.data.equipmentPrice,
        isEquipmentDetain: this.data.isEquipmentDetain,
        businessScale: this.data.businessScale,
        sharePercent: this.data.sharePercent,
        siteArea: this.data.siteArea,
        monthlyRent: this.data.monthlyRent,
        annualIncome: this.data.annualIncome,
        isInCase: this.data.isInCase,
        isInDebt: this.data.isInDebt,
        bankDebt: this.data.bankDebt,
        creditCardDebt: this.data.creditCardDebt,
        hasHouse: this.data.hasHouse,
        houseList: [],
        hasCar: this.data.hasCar,
        carList: [],
        otherMark: this.data.otherMark,
        reference: this.data.reference,
        applyDate: this.data.applyDate,
        // smsCode: this.data.smsCode,
      };
      if (this.data.phone !== this.data.originPhone)
        params.smsCode = this.data.smsCode;
      if (params.marryStatus === 0) params.marryname = this.data.marryname;
      if (params.hasHouse)
        params.houseList = this.data.houseList.map((d) => {
          const obj = {
            isLocal: d.isLocal,
            area: d.area,
            address: d.address,
            totalAmount: d.totalAmount,
            hasCert: d.hasCert,
          };
          if (d.hasCert) {
            obj.certFront = wx.cloud.CDN(
              fs.readFileSync(d.certFront[0].tempFilePath),
            );
            obj.certBack = wx.cloud.CDN(
              fs.readFileSync(d.certBack[0].tempFilePath),
            );
          }
          return obj;
        });
      if (params.hasCar)
        params.carList = this.data.carList.map((d) => {
          const obj = {
            carModel: d.carModel,
            totalAmount: d.totalAmount,
            hasCert: d.hasCert,
          };
          if (d.hasCert) {
            obj.certFront = wx.cloud.CDN(
              fs.readFileSync(d.certFront[0].tempFilePath),
            );
            obj.certBack = wx.cloud.CDN(
              fs.readFileSync(d.certBack[0].tempFilePath),
            );
          }
          return obj;
        });
      try {
        Toast.loading({
          message: '正在提交...',
          forbidClick: false,
          duration: 0,
        });
        const { result: res } = await wx.cloud.callFunction({
          name: 'apply',
          data: params,
          // config: {
          //   traceUser: true,
          // },
        });
        if (res.code === 0) {
          Toast.success('提交成功');
          app.globalData.userInfo.phone = params.phone;
          if (!isTest) this.resetData(params.phone);
        } else {
          Toast.fail(res.msg);
        }
      } catch (e) {
        // console.log(e);
        Toast.fail('请求错误，请稍后重试');
      }
    }
  },

  resetData(phone) {
    // clearInterval(this.data.smsTimer);
    this.setData({
      bornDateTxt: '',
      marryShow: false,
      marryStatusTxt: '',
      useWayTxt: '',
      areaTxt: '',
      businessScaleTxt: '',
      applyDateTxt: `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()}`,
      nameMessage: '',
      phoneMessage: '',
      idCardMessage: '',
      bornDateMessage: '',
      marryStatusMessage: '',
      marrynameMessage: '',
      loanAmountMessage: '',
      useWayMessage: '',
      companyNameMessage: '',
      companyMasterMessage: '',
      companyRecCodeMessage: '',
      areaMessage: '',
      addressMessage: '',
      salaryMessage: '',
      flowingWaterMessage: '',
      annualTurnoverMessage: '',
      equipmentPriceMessage: '',
      businessScaleMessage: '',
      siteAreaMessage: '',
      monthlyRentMessage: '',
      annualIncomeMessage: '',
      bankDebtMessage: '',
      creditCardDebtMessage: '',
      applyDateMessage: '',
      smsCodeMessage: '',
      // 表单数据
      username: '',
      phone,
      idCard: '',
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
      companyRecCode: '',
      bizLicense: [],
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
      isInDebt: false,
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
      applyDate: date.getTime(),
      smsCode: '',
      // smsTips: '发送',
      // smsTimer: null,
      // smsCount: 60,
      originPhone: phone,
    });
  },
  checkUser() {
    if (app.globalData.loadingStatus === 2 && !app.globalData.userInfo.phone) {
      wx.navigateTo({
        url: '../profile/index',
        events: {
          setPhone: (data) => {
            this.setData({
              phone: data.phone,
              phoneMessage: '',
            });
          },
        },
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
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
          console.log(res);
          app.globalData.isReview = res.data[reviewCode];
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
    Toast.clear();
    if (app.globalData.isReview) return;

    // 审核后
    if (app.globalData.loadingStatus === 0) {
      app.globalData.loadingStatus = 1;
      wx.cloud
        .callFunction({
          name: 'user',
          data: { $url: 'getUser' },
        })
        .then(({ result: res }) => {
          console.log(res);
          Toast.clear();
          if (res.code === 0) {
            Object.assign(app.globalData.userInfo, res.data);
            this.setData({ phone: res.data.phone, phoneMessage: '' });
          }
        })
        .catch((err) => {
          Toast.fail('用户信息获取失败');
        })
        .finally(() => {
          app.globalData.loadingStatus = 2;
        });
    } else if (app.globalData.userInfo.phone) {
      this.setData({
        phone: app.globalData.userInfo.phone,
        originPhone: app.globalData.userInfo.phone,
        phoneMessage: '',
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
    if (app.globalData.userInfo.phone !== this.data.originPhone) {
      this.setData({ originPhone: app.globalData.userInfo.phone });
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
  onShareAppMessage() {},
});
