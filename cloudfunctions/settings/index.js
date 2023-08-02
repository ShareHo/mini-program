// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
// Tcb-Router
const TcbRouter = require('tcb-router');

const db = cloud.database();
const cmd = db.command;

// 用户
const userCollection = db.collection('user');
// 配置
const settingsCollection = db.collection('settings');

const SETTING_RECORD_ID = '14a8deea64c8fb6e01034df305046afc';

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID, UNIONID } = cloud.getWXContext();
  // TcbRouter的使用
  const app = new TcbRouter({ event });

  app.router('setPermCodes', async (ctx, next) => {
    try {
      const user = await userCollection
        .where({ _openid: cmd.eq(OPENID) })
        .limit(1)
        .get();
      if (!user.data[0] || user.data[0].role !== 1) {
        ctx.body = { code: 2, msg: '非管理员不可授权' };
        return;
      }
      const settings = await settingsCollection.doc(SETTING_RECORD_ID).get();
      const data = {};
      const code = `${OPENID}@${Date.now()}${Math.random()
        .toString()
        .slice(-9)}`;
      switch (event.role) {
        case 1:
          data.adminCodes = [...settings.data.adminCodes, code];
          break;
        case 2:
          data.businessCodes = [...settings.data.businessCodes, code];
          break;

        default:
          break;
      }
      await settingsCollection.doc(SETTING_RECORD_ID).update({ data });
      ctx.body = {
        code: 0,
        data: code,
      };
      return;
    } catch (e) {
      return { code: 2, msg: '授权码生成错误' };
    }
  });

  app.router('acceptPerm', async (ctx, next) => {
    const settings = await settingsCollection.doc(SETTING_RECORD_ID).get();
    let arrCodes = [];
    const settingsAfterUse = {};
    switch (event.role) {
      case 1:
        arrCodes = settings.data.adminCodes;
        settingsAfterUse.adminCodes = settings.data.adminCodes.filter(
          (d) => d !== event.pcode,
        );
        break;
      case 2:
        arrCodes = settings.data.businessCodes;
        settingsAfterUse.businessCodes = settings.data.businessCodes.filter(
          (d) => d !== event.pcode,
        );
        break;

      default:
        break;
    }
    const userCache = userCollection
      .where({ _openid: cmd.eq(OPENID) })
      .limit(1);
    const user = await userCache.get();
    console.log(arrCodes, event);
    if (!arrCodes.includes(event.pcode)) {
      if (user.data.length === 0) {
        ctx.body = {
          code: 2,
          msg: '授权失败或已被授权',
        };
        return;
      } else {
        ctx.body = {
          code: 0,
          data: user.data[0],
          msg: '授权失败或已被授权',
        };
        return;
      }
    } else {
      if (user.data.length === 0) {
        await userCollection.add({
          data: {
            role: event.role, // 0用户、1管理员、2业务员
            permBy: event.pcode.split('@')[0],
            _openid: OPENID,
            _unionid: UNIONID,
          },
        });
        await settingsCollection
          .doc(SETTING_RECORD_ID)
          .update({ data: settingsAfterUse });
        ctx.body = {
          code: 0,
          data: { role: event.role, permBy: event.pcode.split('@')[0] },
          msg: '授权成功',
        };
      } else {
        // 已经是管理员
        if (event.pcode.split('@')[0] === OPENID || user.data[0].role === 1) {
          ctx.body = {
            code: 0,
            data: user.data[0],
          };
          return;
        }
        await userCache.update({
          data: { role: event.role, permBy: event.pcode.split('@')[0] },
        });
        await settingsCollection
          .doc(SETTING_RECORD_ID)
          .update({ data: settingsAfterUse });
        ctx.body = {
          code: 0,
          data: {
            ...user.data[0],
            role: event.role,
            permBy: event.pcode.split('@')[0],
          },
          msg: '授权成功',
        };
      }

      return;
    }
  });
  app.router('getSettings', async (ctx, next) => {
    try {
      const settings = await settingsCollection
        .doc(SETTING_RECORD_ID)
        .field({ reviewCode1: true, reviewCode2: true })
        .get();
      ctx.body = { code: 0, data: settings.data };
    } catch (e) {
      ctx.body = { code: 2, msg: '获取失败' };
    }
  });
  return app.serve();
};
