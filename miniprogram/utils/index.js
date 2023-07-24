//15位身份证
export const isValidityBrithBy15IdCard = (idCard15) => {
  var year = idCard15.substring(6, 8);
  var month = idCard15.substring(8, 10);
  var day = idCard15.substring(10, 12);
  var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
  // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
  if (
    temp_date.getYear() != parseFloat(year) ||
    temp_date.getMonth() != parseFloat(month) - 1 ||
    temp_date.getDate() != parseFloat(day)
  ) {
    return false;
  }
  return true;
};
//18位生日校验
export const isValidityBrithBy18IdCard = (idCard18) => {
  var year = idCard18.substring(6, 10);
  var month = idCard18.substring(10, 12);
  var day = idCard18.substring(12, 14);
  var temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
  // 这里用getFullYear()获取年份，避免千年虫问题
  if (
    temp_date.getFullYear() != parseFloat(year) ||
    temp_date.getMonth() != parseFloat(month) - 1 ||
    temp_date.getDate() != parseFloat(day)
  ) {
    return false;
  }
  return true;
};
//18位最后一位校验
export const isTrueValidateCodeBy18IdCard = (a_idCard) => {
  var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1]; // 加权因子
  var ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2]; // 身份证验证位值.10代表X
  var sum = 0; // 声明加权求和变量
  if (a_idCard[17].toLowerCase() == 'x') {
    a_idCard[17] = 10; // 将最后位为x的验证码替换为10方便后续操作
  }
  for (var i = 0; i < 17; i++) {
    sum += Wi[i] * a_idCard[i]; // 加权求和
  }
  var valCodePosition = sum % 11; // 得到验证码所位置
  if (a_idCard[17] == ValideCode[valCodePosition]) {
    return true;
  }
  return false;
};

export const dateFormatter = (type, value) => {
  if (type === 'year') {
    return `${value}年`;
  }
  if (type === 'month') {
    return `${value}月`;
  }
  return value;
};

export const validateRealName = (name) => {
  let message = '';
  if (name) {
    if (/^[\u4e00-\u9fa5]{2,30}$/.test(name)) {
      message = '';
    } else {
      message = '您输入的姓名有误';
    }
  } else {
    message = '输入的姓名不能为空';
  }
  return message;
};
