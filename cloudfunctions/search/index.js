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
  const { OPENID, UNIONID } = cloud.getWXContext();
  // TcbRouter的使用
  const app = new TcbRouter({ event });

  app.router('searchList', async (ctx, next) => {
    let params = {};
    if (event.username)
      params.username = db.RegExp({
        regexp: event.username,
        options: 'i',
      });
    if (event.phone)
      params.phone = db.RegExp({
        regexp: event.phone,
        options: 'i',
      });
    if (event.date.length)
      params.createTime = cmd.gte(event.date[0]).and(cmd.lte(event.date[1]));
    console.log(params);
    if (event.isMine) params._openid = cmd.eq(OPENID);
    console.log(params);
    try {
      const dataAll = applyCollection.where(params);
      const { total } = await dataAll.count();
      const { data } = await dataAll
        .orderBy('createTime', 'desc')
        .skip((event.page - 1) * event.size)
        .limit(event.size)
        .field({
          username: true,
          loanAmount: true,
          phone: true,
        })
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
      const { data } = await applyCollection.doc(event.id).get();
      ctx.body = { code: 0, data };
    } catch (e) {
      ctx.body = { code: 2, msg: '获取失败' };
    }
  });
  app.router('deleteDetail', async (ctx, next) => {
    try {
      const apply = applyCollection.doc(event.id);
      const applyRes = await apply.get();
      let fileList = [applyRes.data.idCardFront, applyRes.data.idCardBack];
      applyRes.data.houseList.forEach((d) => {
        if (d.hasCert) {
          fileList.push(d.certFront);
          fileList.push(d.certBack);
        }
      });
      applyRes.data.carList.forEach((d) => {
        if (d.hasCert) {
          fileList.push(d.certFront);
          fileList.push(d.certBack);
        }
      });
      await cloud.deleteFile({ fileList });
      await apply.remove();
      ctx.body = { code: 0, msg: '删除成功' };
    } catch (e) {
      ctx.body = { code: 2, msg: '删除失败' };
    }
  });
  app.router('judgeDetail', async (ctx, next) => {
    try {
      await applyCollection.doc(event.id).update({
        data: { applyStatus: 1, judgeBy: OPENID },
      });
      ctx.body = { code: 0, msg: '审核成功' };
    } catch (e) {
      ctx.body = { code: 2, msg: '审核失败' };
    }
  });

  return app.serve();
};
