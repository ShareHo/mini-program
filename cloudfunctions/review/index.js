// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
// Tcb-Router
const TcbRouter = require('tcb-router');
const db = cloud.database();
const cmd = db.command;
// 验证码
const reviewCollection = db.collection('review');
// const axios = require('axios/dist/node/axios.cjs');
const axios = require('axios');

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

  app.router('addReview', async (ctx, next) => {
    console.log(event);
    try {
      delete event.$url;
      await reviewCollection.add({
        data: {
          ...event,
          createTime: Date.now(),
          isUser: false,
          _openid: OPENID,
        },
      });
      ctx.body = { code: 0, msg: '提交成功' };
    } catch (e) {
      ctx.body = { code: 2, msg: '提交失败' };
    }
  });

  app.router('setUser', async (ctx, next) => {
    const userCache = reviewCollection
      .where({ _openid: cmd.eq(OPENID), isUser: cmd.eq(true) })
      .limit(1);
    const userInfoRes = await userCache.get();

    const data = { nickname: event.nickname, avatarUrl: event.avatarUrl };
    try {
      if (
        (userInfoRes.data.length === 0 ||
          !event.avatarUrl.startsWith('cloud://')) &&
        event.avatarUrl
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

    try {
      if (userInfoRes.data.length > 0) {
        await userCache.update({ data });
      } else {
        await reviewCollection.add({
          data: {
            ...data,
            isUser: true,
            _openid: OPENID,
            _unionid: UNIONID,
          },
        });
      }
      ctx.body = { code: 0, data: data.avatarUrl, msg: '保存成功' };
    } catch (e) {
      console.log(e);
      ctx.body = { code: 2, msg: '保存失败' };
    }
  });

  // 查询用户
  app.router('getUser', async (ctx, next) => {
    ctx.body = await reviewCollection
      .where({ _openid: cmd.eq(OPENID), isUser: cmd.eq(true) })
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

  app.router('searchList', async (ctx, next) => {
    try {
      const dataAll = reviewCollection.where({
        _openid: cmd.eq(OPENID),
        isUser: cmd.eq(false),
      });
      const { total } = await dataAll.count();
      const { data } = await dataAll
        .orderBy('createTime', 'desc')
        .skip((event.page - 1) * event.size)
        .limit(event.size)
        .get();

      console.log(total, data);

      ctx.body = {
        code: 0,
        data,
        total,
        msg: '查询成功',
      };
      return;
    } catch (e) {
      console.log(e);
      ctx.body = { code: 2, msg: '查询失败' };
    }
  });
  app.router('searchDetail', async (ctx, next) => {
    try {
      const { data } = await reviewCollection.doc(event.id).get();
      ctx.body = { code: 0, data };
    } catch (e) {
      ctx.body = { code: 2, msg: '获取失败' };
    }
  });

  return app.serve();
};
