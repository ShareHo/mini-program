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
    secretId: process.env.TC_SECRET_ID,
    secretKey: process.env.TC_SECRET_KEY,
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

// 云函数入口函数
exports.main = async (event, context) => {
  // 通过client对象调用想要访问的接口（Action），需要传入请求对象（Params）以及响应回调函数
  // 即：client.Action(Params).then(res => console.log(res), err => console.error(err))
  try {
    if (event.test) throw new Error();
    const bufferRes = await axios.get(event.ImageBuffer, {
      responseType: 'arraybuffer',
    });
    try {
      const openRes = await cloud.openapi.ocr.idcard({
        type: 'photo',
        img: {
          contentType: 'image/' + event.ImageType,
          value: bufferRes.data,
        },
      });
      console.log(openRes);
      if (openRes.errCode === 0)
        return {
          code: 0,
          data: {
            Name: openRes.name,
            IdNum: openRes.id,
            Birth: openRes.birth.replace(/-/g, '/'),
            Sex: openRes.gender,
            Nation: openRes.nationality,
            Address: openRes.addr,
          },
        };
    } catch (e) {
      console.log(e);
    }
    // const res = await axios.get(event.ImageBase64);
    let binary = '';
    let bytes = new Uint8Array(bufferRes.data);
    for (let len = bytes.byteLength, i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const params = {
      ImageBase64: btoa(binary),
      CardSide: event.CardSide,
    };
    const data = await client.IDCardOCR(params);
    console.log(data);
    return { code: 0, data };
  } catch (err) {
    console.log(err);
    return { code: 2, msg: '请求错误' };
  }
};
