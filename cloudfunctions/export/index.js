// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境
// Tcb-Router
const TcbRouter = require('tcb-router');

const db = cloud.database();
const cmd = db.command;

// 申请
const applyCollection = db.collection('user-apply');
// office生成工具
const officegen = require('officegen');
const fs = require('fs');

function writeDocx() {
  return;
}

async function uploadFile(buffer) {
  const cloudPath = `export/${Date.now()}-${Math.random()
    .toString()
    .slice(-6)}.docx`;
  return await cloud.uploadFile({
    cloudPath,
    fileContent: buffer,
  });
}

const EXPORT_FIELD = [
  { key: 'username', label: '客户姓名：' },
  { key: 'phone', label: '手机号码：' },
  { key: 'idCard', label: '身份证号：' },
  { key: 'area', label: '现住家庭地址：' },
  { key: 'address', label: '详细地址：' },
  { key: 'marryStatus', label: '婚姻状况：' },
  { key: 'marryname', label: '配偶姓名：' },
  { key: 'idCardFront', label: '身份证正面：' },
  { key: 'idCardBack', label: '身份证反面：' },
  { key: 'loanAmount', label: '申请额度：', unit: '万元' },
  { key: 'useWay', label: '借款用途：' },
  { key: 'useWayMark', label: '备注(借款用途)：' },
  { key: 'isFamilySupport', label: '家人是否支持贷款：' },
  { key: 'companyName', label: '公司全称：' },
  { key: 'companyMaster', label: '公司法人：' },
  { key: 'bizLicense', label: '营业执照：' },
  { key: 'operYears', label: '经营年限：', unit: '年' },
  { key: 'companyMember', label: '员工人数：', unit: '人' },
  { key: 'flowingWater', label: '月收入：', unit: '万元' },
  { key: 'annualTurnover', label: '年营业额：', unit: '万元' },
  { key: 'isSufficient', label: '订单是否充足：' },
  { key: 'equipmentPrice', label: '设备价值：', unit: '万元' },
  { key: 'isEquipmentDetain', label: '订单是否在押：' },
  { key: 'businessScale', label: '企业规模：' },
  { key: 'sharePercent', label: '占股百分比：', unit: '%' },
  { key: 'siteArea', label: '场地面积：', unit: '㎡' },
  { key: 'monthlyRent', label: '场地月缴租金：', unit: '万元' },
  { key: 'isInDebt', label: '是否有高息私人贷：' },
  { key: 'bankDebt', label: '银行总贷款额度：', unit: '万元' },
  { key: 'creditCardDebt', label: '信用卡总额度：', unit: '万元' },
  { key: 'hasHouse', label: '名下有无房产：' },
  { key: 'hasCar', label: '名下有无车产：' },
  { key: 'reference', label: '推荐人代码：' },
  { key: 'applyDate', label: '填表日期：' },
];

// 云函数入口函数
exports.main = async (event, context) => {
  // const { OPENID, UNIONID } = cloud.getWXContext();
  // TcbRouter的使用
  const app = new TcbRouter({ event });

  app.router('exportDetail', async (ctx, next) => {
    try {
      const { data } = await applyCollection.doc(event.id).get();
      if (data._is_deleted) {
        ctx.body = { code: 2, msg: '该申请已被删除，请联系管理员' };
        return;
      }
      console.log(data);
      const fileList = [data.idCardFront, data.idCardBack, data.bizLicense];
      const result = await cloud.getTempFileURL({ fileList });
      // console.log(result);
      const writeDocx = new Promise((resolve, reject) => {
        let docx = officegen('docx');
        let pObj = docx.createP();
        EXPORT_FIELD.forEach((d) => {
          pObj.addText(d.label, { font_size: 14 });
          pObj.addText(data[d.key].toString(), { font_size: 14 });
          pObj.addLineBreak();
        });
        // pObj.addText('External link', {
        //   link: 'https://github.com',
        //   underline: true,
        //   color: '0000ff',
        // });
        // pObj.addLineBreak();
        let out = fs.createWriteStream('/tmp/example.docx');
        out.on('error', reject);
        out.on('close', () => {
          let file = fs.readFileSync('/tmp/example.docx');
          resolve(file);
        });
        docx.on('error', reject);
        docx.generate(out);
      });
      const file = await writeDocx;
      const uploadRes = await uploadFile(file);
      const exportDocx = await cloud.getTempFileURL({
        fileList: [uploadRes.fileID],
      });
      // console.log(uploadRes);
      ctx.body = {
        code: 0,
        data: exportDocx.fileList[0].tempFileURL,
        msg: 'success',
      };
    } catch (e) {
      ctx.body = { code: 2, msg: '导出失败', err: e };
    }
  });

  app.router('exportList', async (ctx, next) => {
    try {
      // const file = await writeDocx();
      // await uploadFile(file);
      ctx.body = { code: 2, msg: '功能开发中' };
      return;
    } catch (e) {
      ctx.body = { code: 2, msg: '导出失败', err: e };
    }
  });

  return app.serve();
};
