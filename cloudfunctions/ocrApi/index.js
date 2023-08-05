// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
// Tcb-Router
const TcbRouter = require('tcb-router');
const axios = require('axios/dist/node/axios.cjs');
// const axios = require('axios');

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
      endpoint: 'ocr.tencentcloudapi.com',
    },
  },
});
// 云函数入口函数
exports.main = async (event, context) => {
  // TcbRouter的使用
  const app = new TcbRouter({ event });
  // 身份证
  app.router('idCard', async (ctx, next) => {
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
        if (openRes.errCode === 0) {
          ctx.body = {
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
          return;
        }
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
      ctx.body = { code: 0, data };
      return;
    } catch (err) {
      console.log(err);
      ctx.body = { code: 2, msg: '请求错误' };
      return;
    }
  });
  // 行驶证
  app.router('vehicleLicense', async (ctx, next) => {
    try {
      if (event.test) throw new Error();
      const bufferRes = await axios.get(event.ImageBuffer, {
        responseType: 'arraybuffer',
      });
      try {
        const openRes = await cloud.openapi.ocr.drivingLicense({
          type: 'photo',
          img: {
            contentType: 'image/' + event.ImageType,
            value: bufferRes.data,
          },
        });
        console.log(openRes);
        if (openRes.errCode === 0) {
          ctx.body = {
            code: 0,
            data: {
              FrontInfo: {
                Model: openRes.model,
              },
            },
          };
          return;
        }
      } catch (e) {
        console.log(e);
      }
      // const res = await axios.get(event.ImageBase64);
      let binary = '';
      let bytes = new Uint8Array(bufferRes.data);
      for (let len = bytes.byteLength, i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      // const res = await axios.get(event.ImageBase64);
      const params = {
        ImageBase64: btoa(binary),
        CardSide: event.CardSide,
      };
      console.log(res);
      const data = await client.VehicleLicenseOCR(params);
      console.log(data);
      ctx.body = { code: 0, data };
      return;
    } catch (err) {
      console.log(err);
      ctx.body = { code: 2, msg: '请求错误' };
      return;
    }
  });
  // 营业执照
  app.router('bizLicense', async (ctx, next) => {
    try {
      if (event.test) throw new Error();
      const bufferRes = await axios.get(event.ImageBuffer, {
        responseType: 'arraybuffer',
      });
      try {
        const openRes = await cloud.openapi.ocr.businessLicense({
          type: 'photo',
          img: {
            contentType: 'image/' + event.ImageType,
            value: bufferRes.data,
          },
        });
        console.log(openRes);
        if (openRes.errCode === 0) {
          ctx.body = {
            code: 0,
            data: {
              RegNum: openRes.regNum,
              Person: openRes.legalRepresentative,
              Name: openRes.enterpriseName,
            },
          };
          return;
        }
      } catch (e) {
        console.log(e);
      }
      // const res = await axios.get(event.ImageBase64);
      let binary = '';
      let bytes = new Uint8Array(bufferRes.data);
      for (let len = bytes.byteLength, i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      // const res = await axios.get(event.ImageBase64);
      const params = {
        ImageBase64: btoa(binary),
      };
      console.log(res);
      const data = await client.BizLicenseOCR(params);
      console.log(data);
      ctx.body = { code: 0, data };
      return;
    } catch (err) {
      console.log(err);
      ctx.body = { code: 2, msg: '请求错误' };
      return;
    }
  });
  return app.serve();
};
