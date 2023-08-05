// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
const db = cloud.database();
const cmd = db.command;
// 用户
const userCollection = db.collection('user');

async function uploadFile(buffer, openid, type) {
  // const { data: buffer } = await axios.get(cdnBuffer, {
  //   responseType: 'arraybuffer',
  // });
  console.log(buffer);
  const cloudPath = `qrcode/${openid}-${Date.now()}-${Math.random()
    .toString()
    .slice(-6)}.${type}`;
  return await cloud.uploadFile({
    cloudPath,
    fileContent: buffer,
  });
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID, UNIONID } = cloud.getWXContext();
  try {
    const userCache = userCollection
      .where({ _openid: cmd.eq(OPENID) })
      .limit(1);
    const user = await userCache.get();
    if (!user.data[0].referenceQr) {
      const result = await cloud.openapi.wxacode.getUnlimited({
        page: 'pages/index/index',
        scene: user.data[0].referenceCode,
        autoColor: true,
        // envVersion: 'develop',
      });
      console.log(result);
      if (result.errCode === 0) {
        const { fileID, statusCode } = await uploadFile(
          result.buffer,
          OPENID,
          result.contentType.split('/')[1],
        );
        if (fileID && statusCode === -1) {
          await userCache.update({ data: { referenceQr: fileID } });
          return { code: 0, data: fileID };
        } else {
          return { code: 2, msg: '生成失败' };
        }
      } else {
      }
    } else {
      return { code: 0, data: user.data[0].referenceQr };
    }
  } catch (err) {
    return err;
  }
};
