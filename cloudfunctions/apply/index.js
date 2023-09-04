// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
const db = cloud.database();
const cmd = db.command;
// 验证码
const smsCollection = db.collection('sms-code');
// 申请
const applyCollection = db.collection('user-apply');
// 用户
const userCollection = db.collection('user');

const axios = require('axios/dist/node/axios.cjs');
// const axios = require('axios');

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

async function uploadFile(cdnBuffer, openid) {
  const { data: buffer } = await axios.get(cdnBuffer, {
    responseType: 'arraybuffer',
  });
  console.log(buffer);
  const cloudPath = `user-card/${openid}-${Date.now()}-${Math.random()
    .toString()
    .slice(-6)}.jpg`;
  return await cloud.uploadFile({
    cloudPath,
    fileContent: buffer,
  });
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID, UNIONID } = cloud.getWXContext();
  // const date = new Date();
  // console.log(
  //   `${date.getFullYear()}/${
  //     date.getMonth() + 1
  //   }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
  // );
  try {
    const userApplyCache = applyCollection
      .where({ _openid: cmd.eq(OPENID), applyStatus: cmd.eq(0) })
      .limit(1);
    const cache = await userApplyCache.get();
    if (cache.data.length > 0) {
      return { code: 2, msg: '当前还有未结束的申请' };
    }
  } catch (e) {
    console.log(e);
  }
  let referenceOpenid = '';
  let referenceData = null;
  try {
    referenceData = await userCollection
      .where({ referenceCode: cmd.eq(+event.reference) })
      .limit(1)
      .get();
    if (referenceData.data.length === 0) {
      return { code: 2, msg: '推荐人代码有误' };
    } else if (!referenceData.data[0].role) {
      return { code: 2, msg: '推荐人非公司成员' };
    } else {
      referenceOpenid = referenceData.data[0]._openid;
    }
  } catch (e) {
    return { code: 2, msg: '推荐人代码有误' };
  }
  try {
    const userCache = userCollection
      .where({ _openid: cmd.eq(OPENID) })
      .limit(1);
    const userInfoRes = await userCache.get();
    if (
      userInfoRes.data.length === 0 ||
      userInfoRes.data[0].phone !== event.phone
    ) {
      const userSmsCache = smsCollection
        .where({ _openid: cmd.eq(OPENID) })
        .limit(1);
      const cache = await userSmsCache.get();

      if (cache.data.length === 0) {
        return { code: 2, msg: '请先发送验证码' };
      } else {
        console.log(cache.data);
        const { timestamp, valid_time, sms_code, is_used } = cache.data[0];
        const { smsCode } = event;
        // 校验验证码有效期
        const offset = Date.now() - timestamp;
        if (offset > 5 * 60 * 1000 || valid_time >= 10 || is_used) {
          return { code: 2, msg: '验证码已失效' };
        } else if (+smsCode !== +sms_code) {
          const time = valid_time + 1;
          await userSmsCache.update({ data: { valid_time: time } });
          return { code: 2, msg: '验证码错误' };
        } else {
          await userSmsCache.update({ data: { is_used: true } });
        }
      }
    }
    // 身份证正
    try {
      const { fileID, statusCode } = await uploadFile(
        event.idCardFront,
        OPENID,
      );
      if (fileID && statusCode === -1) event.idCardFront = fileID;
    } catch (e) {
      event.idCardFront = '';
    }
    // 身份证反
    try {
      const { fileID, statusCode } = await uploadFile(event.idCardBack, OPENID);
      if (fileID && statusCode === -1) event.idCardBack = fileID;
    } catch (e) {
      event.idCardBack = '';
    }
    // 营业执照
    if (event.bizLicense) {
      try {
        const { fileID, statusCode } = await uploadFile(
          event.bizLicense,
          OPENID,
        );
        if (fileID && statusCode === -1) event.bizLicense = fileID;
      } catch (e) {
        event.bizLicense = '';
      }
    }
    // 车产房产证
    // for (const item of [...event.houseList, ...event.carList]) {
    //   if (item.hasCert) {
    //     // 正
    //     try {
    //       const { fileID, statusCode } = await uploadFile(
    //         item.certFront,
    //         OPENID,
    //       );
    //       if (fileID && statusCode === -1) item.certFront = fileID;
    //     } catch (e) {
    //       item.certFront = '';
    //     }
    //     // 反
    //     try {
    //       const { fileID, statusCode } = await uploadFile(
    //         item.certBack,
    //         OPENID,
    //       );
    //       if (fileID && statusCode === -1) item.certBack = fileID;
    //     } catch (e) {
    //       item.certBack = '';
    //     }
    //   }
    // }
    delete event.smsCode;
    // delete event.userInfo;
    await applyCollection.add({
      data: {
        ...event,
        applyStatus: 0,
        referenceOpenid,
        createTime: Date.now(),
        updateTime: Date.now(),
        _is_deleted: 0,
        _openid: OPENID,
        _unionid: UNIONID,
      },
    });
    // 同步用户信息
    const userupt = {
      username: event.username,
      phone: event.phone,
      idCard: event.idCard,
      idCardFront: event.idCardFront,
      idCardBack: event.idCardBack,
      // bornDate: event.bornDate,
      area: event.area,
      address: event.address,
      marryStatus: event.marryStatus,
      marryname: event.marryname,
    };
    if (userInfoRes.data.length === 0) {
      userCollection.add({
        ...userupt,
        _openid: OPENID,
        _unionid: UNIONID,
      });
    } else {
      userCache.update({ data: userupt });
    }

    userCollection
      .where({ role: cmd.eq(3) })
      .get()
      .then((res) => {
        // console.log(res);
        if (res.data && res.data.length > 0) {
          res.data.forEach((d) => {
            if (d.phone) {
              const params = {
                SmsSdkAppId: '1400841823', //短信应用id
                TemplateId: '1917380', //腾讯云短信模板id
                PhoneNumberSet: ['+86' + d.phone], //大陆手机号861856624****
                SignName: '启赢信息咨询', //腾讯云短信签名
                TemplateParamSet: [
                  `【${d.nickname}】`,
                  event.username,
                  event.phone,
                  referenceData.data[0].nickname,
                  referenceData.data[0].phone || '无手机',
                ],
              };
              client.SendSms(params);
            }
          });
        }
      });
    // const params = {
    //   SmsSdkAppId: '1400841823', //短信应用id
    //   TemplateId: '1917380', //腾讯云短信模板id
    //   PhoneNumberSet: ['+86' + event.phone], //大陆手机号861856624****
    //   SignName: '启赢信息咨询', //腾讯云短信签名
    //   TemplateParamSet: [, '5'],
    // };
    // client.SendSms(params);

    return { code: 0, msg: '提交成功' };
  } catch (e) {
    console.log(e);
    return { code: 2, msg: '请求失败，请稍后重试' };
  }
};
