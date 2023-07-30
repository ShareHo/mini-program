// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
// Tcb-Router
const TcbRouter = require('tcb-router');

const axios = require('axios/dist/node/axios.cjs');
// const axios = require('axios');

const db = cloud.database();
const cmd = db.command;
// 用户
const userCollection = db.collection('user');
// 验证码
const smsCollection = db.collection('sms-code');

async function uploadFile(cdnBuffer, openid) {
  const { data: buffer } = await axios.get(cdnBuffer, {
    responseType: 'arraybuffer',
  });
  console.log(buffer);
  const cloudPath = `user-avatar/${openid}-${Date.now()}-${Math.random()
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
  // TcbRouter的使用
  const app = new TcbRouter({ event });

  // 设置用户
  app.router('setUser', async (ctx, next) => {
    const userCache = userCollection
      .where({ _openid: cmd.eq(OPENID) })
      .limit(1);
    const userInfoRes = await userCache.get();
    console.log(userInfoRes.data, event.phone);
    if (
      userInfoRes.data.length === 0 ||
      userInfoRes.data[0].phone !== event.phone
    ) {
      const userSmsCache = smsCollection
        .where({ _openid: cmd.eq(OPENID) })
        .limit(1);
      const cache = await userSmsCache.get();

      if (cache.data.length === 0) {
        ctx.body = { code: 2, msg: '请先发送验证码' };
        return;
      } else {
        console.log(cache.data);
        const { timestamp, valid_time, sms_code, is_used } = cache.data[0];
        const { smsCode } = event;
        // 校验验证码有效期
        const offset = Date.now() - timestamp;
        console.log(event);
        if (offset > 5 * 60 * 1000 || valid_time >= 10 || is_used) {
          ctx.body = { code: 2, msg: '验证码已失效' };
          return;
        } else if (+smsCode !== +sms_code) {
          const time = valid_time + 1;
          await userSmsCache.update({ data: { valid_time: time } });
          ctx.body = { code: 2, msg: '验证码错误' };
          return;
        } else {
          await userSmsCache.update({ data: { is_used: true } });
        }
      }
    }
    let data = { ...event };
    delete data.$url;
    delete data.smsCode;
    delete data.userInfo;
    try {
      if (
        userInfoRes.data.length === 0 ||
        event.avatarUrl !== userInfoRes.data[0].avatarUrl
      ) {
        const { fileID, statusCode } = await uploadFile(
          event.avatarUrl,
          OPENID,
        );
        if (fileID && statusCode === -1) data.avatarUrl = fileID;
      }
    } catch (e) {
      console.log(e);
      data.avatarUrl = '';
    }
    if (userInfoRes.data.length > 0) {
      await userCache.update({ data });
    } else {
      await userCollection.add({
        data: {
          ...data,
          role: 0, // 0用户、1管理员、2业务员
          _openid: OPENID,
          _unionid: UNIONID,
        },
      });
    }
    ctx.body = { code: 0, data, msg: '保存成功' };
  });

  // 查询用户
  app.router('getUser', async (ctx, next) => {
    ctx.body = await userCollection
      .where({ _openid: cmd.eq(OPENID) })
      .limit(1)
      .get()
      .then((res) => {
        if (res.data.length > 0) {
          return { code: 0, data: res.data[0] };
        } else {
          return { code: 2, msg: '当前用户暂未注册' };
        }
      });
  });

  return app.serve();
};
