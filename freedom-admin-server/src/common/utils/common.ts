/**
 * 功能：工具类
 * 作者：临界
 * 日期：2021.11.19
 */

export const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, time);
  });
};
