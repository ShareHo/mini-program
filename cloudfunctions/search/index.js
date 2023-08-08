// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
// Tcb-Router
const TcbRouter = require('tcb-router');

const db = cloud.database();
const cmd = db.command;

// 申请
const applyCollection = db.collection('user-apply');
// 用户
const userCollection = db.collection('user');

/**
 * @name formatTime 转换为时间格式方法自定义方式
 * @param {number} value 时间戳
 * @param {string} format 格式比如"yyyy-MM-dd hh:mm:ss"
 * @returns {string}
 */
const formatTime = (value = Date.now(), targetFormat = 'yyyy-MM-dd') => {
  let time = new Date(parseInt(value));
  let date = {
    'Y+': time.getFullYear(),
    'M+': time.getMonth() + 1,
    'd+': time.getDate(),
    'h+': time.getHours(),
    'm+': time.getMinutes(),
    's+': time.getSeconds(),
    'q+': Math.floor((time.getMonth() + 3) / 3),
    'S+': time.getMilliseconds(),
  };
  if (/(y+)/i.test(targetFormat)) {
    targetFormat = targetFormat.replace(
      RegExp.$1,
      (time.getFullYear() + '').substr(4 - RegExp.$1.length),
    );
  }
  for (let k in date) {
    if (new RegExp('(' + k + ')').test(targetFormat)) {
      targetFormat = targetFormat.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? date[k]
          : ('00' + date[k]).substr(('' + date[k]).length),
      );
    }
  }
  return targetFormat;
};

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
    let applyCollectioWhere = applyCollection;
    const userCache = userCollection
      .where({ _openid: cmd.eq(OPENID) })
      .limit(1);
    const userInfoRes = await userCache.get();
    if (event.isMine) {
      params._openid = cmd.eq(OPENID);
    } else if (userInfoRes.data[0].role === 2) {
      // applyCollectioWhere = applyCollection.where(
      //   cmd.or([
      //     { reference: cmd.eq(`${userInfoRes.data[0].referenceCode}`) },
      //     { _openid: cmd.eq(OPENID) },
      //   ]),
      // );
      params.referenceOpenid = cmd.eq(OPENID);
    }

    try {
      const dataAll = applyCollectioWhere.where(params);
      const { total } = await dataAll.count();
      const { data } = await dataAll
        .orderBy('createTime', 'desc')
        .skip((event.page - 1) * event.size)
        .limit(event.size)
        .field({
          username: true,
          loanAmount: true,
          phone: true,
          applyDate: true,
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

      const reference = await userCollection
        .where({ _openid: cmd.eq(data.referenceOpenid) })
        .limit(1)
        .get();
      if (data.applyStatus !== 0) {
        const judgeBy = await userCollection
          .where({ _openid: cmd.eq(data.judgeBy) })
          .limit(1)
          .get();
        data.judgeByName = judgeBy.data[0].nickname;
        data.judgeByCode = judgeBy.data[0].referenceCode;
      }
      ctx.body = {
        code: 0,
        data: {
          ...data,
          referenceName: reference.data[0].nickname,
        },
      };
    } catch (e) {
      console.log(e);
      ctx.body = { code: 2, msg: '获取失败' };
    }
  });
  app.router('deleteDetail', async (ctx, next) => {
    try {
      // const apply = applyCollection.doc(event.id);
      // const applyRes = await apply.get();
      // let fileList = [applyRes.data.idCardFront, applyRes.data.idCardBack];
      // applyRes.data.houseList.forEach((d) => {
      //   if (d.hasCert) {
      //     fileList.push(d.certFront);
      //     fileList.push(d.certBack);
      //   }
      // });
      // applyRes.data.carList.forEach((d) => {
      //   if (d.hasCert) {
      //     fileList.push(d.certFront);
      //     fileList.push(d.certBack);
      //   }
      // });
      // await cloud.deleteFile({ fileList });
      // await apply.remove();
      await applyCollection.doc(event.id).update({
        data: {
          applyStatus: 2,
          judgeBy: OPENID,
          judgeTime: Date.now(),
          updateTime: Date.now(),
        },
      });
      const apply = await applyCollection.doc(event.id).get();
      cloud.openapi.subscribeMessage.send({
        touser: apply.data._openid,
        page: `pages/detail/index?role=0&id=${event.id}`,
        lang: 'zh_CN',
        miniprogram_state: 'developer',
        templateId: 'clyY5RJiJwLy7BUrAd1w2ylGwPqkF-rfJzoVvVHvZ-c',
        miniprogramState: 'developer',
        data: {
          phrase1: {
            value: '审批拒绝',
          },
          date3: {
            value: formatTime(Date.now(), 'yyyy/MM/dd hh:mm:ss'),
          },
          thing11: {
            value: apply.data.username,
          },
        },
      });
      ctx.body = { code: 0, msg: '审核成功' };
    } catch (e) {
      ctx.body = { code: 2, msg: '审核失败' };
    }
  });
  app.router('judgeDetail', async (ctx, next) => {
    try {
      await applyCollection.doc(event.id).update({
        data: {
          applyStatus: 1,
          judgeBy: OPENID,
          judgeTime: Date.now(),
          updateTime: Date.now(),
        },
      });
      const apply = await applyCollection.doc(event.id).get();
      cloud.openapi.subscribeMessage.send({
        touser: apply.data._openid,
        page: `pages/detail/index?role=0&id=${event.id}`,
        lang: 'zh_CN',
        miniprogram_state: 'developer',
        templateId: 'clyY5RJiJwLy7BUrAd1w2ylGwPqkF-rfJzoVvVHvZ-c',
        miniprogramState: 'developer',
        data: {
          phrase1: {
            value: '审批通过',
          },
          date3: {
            value: formatTime(Date.now(), 'yyyy/MM/dd hh:mm:ss'),
          },
          thing11: {
            value: apply.data.username,
          },
        },
      });
      ctx.body = { code: 0, msg: '审核成功' };
    } catch (e) {
      ctx.body = { code: 2, msg: '审核失败' };
    }
  });
  app.router('memberList', async (ctx, next) => {
    let params = {};
    if (event.nickname)
      params.nickname = db.RegExp({
        regexp: event.nickname,
        options: 'i',
      });
    if (event.phone)
      params.phone = db.RegExp({
        regexp: event.phone,
        options: 'i',
      });
    if (event.referenceCode)
      params.referenceCode = db.RegExp({
        regexp: event.referenceCode,
        options: 'i',
      });
    if (event.role) {
      params.role = cmd.eq(event.role);
    } else {
      params.role = cmd.neq(0);
    }
    console.log(params);

    try {
      const dataAll = userCollection.where(params);
      const { total } = await dataAll.count();
      const { data } = await dataAll
        .orderBy('createTime', 'desc')
        .skip((event.page - 1) * event.size)
        .limit(event.size)
        .field({
          nickname: true,
          referenceCode: true,
          phone: true,
          role: true,
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
  app.router('setRole', async (ctx, next) => {
    try {
      const user = await userCollection
        .where({ _openid: cmd.eq(OPENID) })
        .limit(1)
        .get();
      if (user.data.length && user.data[0].role === 1) {
        let data = { role: event.role };
        if (event.role === 0) data.referenceCode = 0;
        await userCollection.doc(event.id).update({ data });
        ctx.body = { code: 0, msg: '操作成功' };
        return;
      } else {
        ctx.body = { code: 2, msg: '非管理员不可操作' };
        return;
      }
    } catch (e) {
      ctx.body = { code: 2, msg: '变更失败' };
      return;
    }
  });

  return app.serve();
};
