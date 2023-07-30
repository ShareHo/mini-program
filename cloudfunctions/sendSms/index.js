// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

const db = cloud.database();
const cmd = db.command;

// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require('tencentcloud-sdk-nodejs-sms');

const SmsClient = tencentcloud.sms.v20210111.Client;

// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
// 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
const clientConfig = {
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
      endpoint: 'sms.tencentcloudapi.com',
    },
  },
};

// 实例化要请求产品的client对象,clientProfile是可选的
const client = new SmsClient(clientConfig);

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  try {
    const code = Math.random().toString().slice(-6); //生成6位数随机验证码
    const userSmsCache = db
      .collection('sms-code')
      .where({ _openid: cmd.eq(wxContext.OPENID) })
      .limit(1);
    const cache = await userSmsCache.get();

    console.log(cache);
    if (event.test) {
      const data = {
        sms_code: code,
        timestamp: Date.now(),
        valid_time: 0,
        is_used: false,
      };
      if (cache.data.length === 0) {
        await db.collection('sms-code').add({
          data: {
            _openid: wxContext.OPENID,
            _unionid: wxContext.UNIONID,
            ...data,
          },
        });
      } else {
        await userSmsCache.update({ data });
      }
      return { code: 0, data: code, msg: '验证码发送成功' };
    }
    const params = {
      SmsSdkAppId: process.env.SMS_SDKAPPID, //短信应用id
      TemplateId: process.env.SMS_TEMPLATE_ID, //腾讯云短信模板id
      PhoneNumberSet: ['+86' + event.phone], //大陆手机号861856624****
      SignName: '启赢信息咨询', //腾讯云短信签名
      TemplateParamSet: [code, '5'],
    };
    const res = await client.SendSms(params);
    const { SendStatusSet } = res;
    if (SendStatusSet[0].Code === 'Ok') {
      const data = {
        sms_code: code,
        timestamp: Date.now(),
        valid_time: 0,
        is_used: false,
      };
      if (cache.data.length === 0) {
        await db.collection('sms-code').add({
          data: {
            _openid: wxContext.OPENID,
            _unionid: wxContext.UNIONID,
            ...data,
          },
        });
      } else {
        await userSmsCache.update({ data });
      }
      return { code: 0, msg: '验证码发送成功' };
    }
    return { code: 2, msg: '验证码发送失败' };
  } catch (err) {
    return { code: 2, msg: '验证码发送失败' };
  }
};
