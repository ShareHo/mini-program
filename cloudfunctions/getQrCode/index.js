// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
const db = cloud.database();
const cmd = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      page: 'pages/index/index',
      scene: 'a=1',
      checkPath: true,
      envVersion: 'develop',
    });
    return result;
  } catch (err) {
    return err;
  }
};
