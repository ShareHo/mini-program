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

// 校验真实名字
export const validateRealName = (name, type = '姓名') => {
  let message = '';
  if (name) {
    if (/^[\u4e00-\u9fa5]{2,30}$/.test(name)) {
      message = '';
    } else {
      message = `您输入的${type}有误`;
    }
  } else {
    message = `${type}不能为空`;
  }
  return message;
};

// 校验手机号
export const validatePhone = (phone, type = '手机号') => {
  let message = '';
  if (phone) {
    if (/^1[3-9]\d{9}$/.test(phone)) {
      message = '';
    } else {
      message = `您输入的${type}有误`;
    }
  } else {
    message = `${type}不能为空`;
  }
  return message;
};

// 校验身份证
export const validateIdCard = (idCard) => {
  let message = '';
  if (idCard.length == 15) {
    if (isValidityBrithBy15IdCard(idCard)) {
      message = '';
    } else {
      message = '您输入的身份证有误';
    }
  } else if (idCard.length == 18) {
    var a_idCard = idCard.split(''); // 得到身份证数组
    if (
      isValidityBrithBy18IdCard(idCard) &&
      isTrueValidateCodeBy18IdCard(a_idCard)
    ) {
      //进行18位身份证的基本验证和第18位的验证
      message = '';
    } else {
      message = '您输入的身份证有误';
    }
  } else {
    if (idCard.length === 0) {
      message = '身份证号不能为空';
    } else {
      message = '您输入的身份证长度有误';
    }
  }
  return message;
};

export const validateAmount = (amount, type = '金额') => {
  let message = '';
  if (+amount > 0) {
    message = '';
  } else if (amount.trim() !== '' && +amount === 0) {
    message = `${type}必须大于0`;
  } else {
    message = `您输入的${type}有误`;
  }
  return message;
};

export const validateNumber = (amount, type = '金额') => {
  let message = '';
  console.log(+amount);
  if (+amount >= 0) {
    message = '';
  } else {
    message = `您输入的${type}有误`;
  }
  return message;
};

export const validateSmsCode = (smsCode) => {
  let message = '';
  if (smsCode) {
    if (/^\d{6}$/.test(smsCode)) {
      message = '';
    } else {
      message = '您输入的验证码格式有误';
    }
  } else {
    message = '验证码不能为空';
  }
  return message;
};

export const validateReference = (reference) => {
  let message = '';
  if (reference) {
    if (/^\d{4}$/.test(reference)) {
      message = '';
    } else {
      message = '您输入的推荐人代码有误';
    }
  } else {
    message = '推荐人代码不能为空';
  }
  return message;
};

/**
 * @name formatTime 转换为时间格式方法自定义方式
 * @param {number} value 时间戳
 * @param {string} format 格式比如"yyyy-MM-dd hh:mm:ss"
 * @returns {string}
 */
export const formatTime = (value = Date.now(), targetFormat = 'yyyy-MM-dd') => {
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
