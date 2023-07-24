// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

const axios = require('axios/dist/node/axios.cjs');

const tencentcloud = require('tencentcloud-sdk-nodejs');

// 导入对应产品模块的client models。
const OcrClient = tencentcloud.ocr.v20181119.Client;

// 实例化要请求产品的client对象
const client = new OcrClient({
  // 腾讯云认证信息
  credential: {
    // 
  },
  // 产品地域
  region: 'ap-guangzhou',
  // 可选配置实例
  profile: {
    signMethod: 'TC3-HMAC-SHA256', // 签名方法
    httpProfile: {
      reqMethod: 'POST', // 请求方法
      reqTimeout: 30, // 请求超时时间，默认60s
    },
  },
});

const params = {
  ImageUrl:
    'https://ocr-demo-1254418846.cos.ap-guangzhou.myqcloud.com/card/IDCardOCR/IDCardOCR1.jpg',
};

// 云函数入口函数
exports.main = async (event, context) => {
  // 通过client对象调用想要访问的接口（Action），需要传入请求对象（Params）以及响应回调函数
  // 即：client.Action(Params).then(res => console.log(res), err => console.error(err))
  try {
    const res = await axios.get(event.ImageBase64);
    const params = {
      ImageBase64: res.data,
      CardSide: event.CardSide,
    };
    const data = await client.IDCardOCR(params);
    return { code: 0, data };
  } catch (err) {
    return { code: 2, msg: '请求错误' };
  }
};
