// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
// Tcb-Router
const TcbRouter = require('tcb-router');

const db = cloud.database();
const cmd = db.command;

// 申请
const applyCollection = db.collection('user-apply');

// 云函数入口函数
exports.main = async (event, context) => {
  // const { OPENID, UNIONID } = cloud.getWXContext();
  // TcbRouter的使用
  const app = new TcbRouter({ event });

  app.router('exportDetail', async (ctx, next) => {
    try {
      ctx.body = { code: 2, msg: '功能开发中' };
      return;
      // const apply = applyCollection.doc(event.id);
      // await apply.update({ data: { _is_deleted: 1 } });
      // ctx.body = { code: 0, msg: '删除成功' };
    } catch (e) {
      ctx.body = { code: 2, msg: '导出失败' };
    }
  });

  app.router('exportList', async (ctx, next) => {
    try {
      ctx.body = { code: 2, msg: '功能开发中' };
      return;
    } catch (e) {
      ctx.body = { code: 2, msg: '导出失败' };
    }
  });

  return app.serve();
};
