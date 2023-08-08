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
  try {
    const referenceData = await userCollection
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
    return { code: 0, msg: '提交成功' };
  } catch (e) {
    console.log(e);
    return { code: 2, msg: '请求失败，请稍后重试' };
  }
};
