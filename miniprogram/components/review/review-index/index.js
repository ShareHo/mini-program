// components/review/review-index/index.js
import Toast from '@vant/weapp/toast/toast';
Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    useWayShow: false,
    useWayColumns: [
      { id: 0, value: '生产经营' },
      { id: 1, value: '购买材料' },
      { id: 2, value: '添置设备' },
      { id: 3, value: '扩大经营模式' },
    ],
    autosize: { minHeight: 70 },
    // 表单数据
    username: '',
    useWay: '',
    message: '',
    rate: '',
    productList: [
      {
        name: '',
        desc: '',
        model: '',
        peitao: '',
        caizhi: '',
        time: '',
        price: '',
        sell: '',
      },
    ],
    remark: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 借款用途
    openUseWayPicker() {
      this.setData({ useWayShow: true });
    },
    useWayCancel() {
      this.setData({ useWayShow: false });
    },
    useWayConfirm(event) {
      console.log(event);
      this.setData({
        useWayShow: false,
        useWay: event.detail.value.value,
      });
    },
    productChange(e) {
      const field = e.currentTarget.dataset.field.split('-');
      this.data.productList[field[1]][field[0]] = e.detail;
      this.setData({ productList: this.data.productList });
    },
    addProduct() {
      const product = {
        name: '',
        desc: '',
        model: '',
        peitao: '',
        caizhi: '',
        time: '',
        price: '',
        sell: '',
      };
      this.setData({ productList: [...this.data.productList, product] });
    },
    deleteProduct(e) {
      const index = e.target.dataset.index;
      wx.showModal({
        title: `确定删除产品${index + 1}？`,
      }).then((res) => {
        if (res.confirm) {
          this.data.productList.splice(index, 1);
          this.setData({ productList: this.data.productList });
        }
      });
    },
    async handleApply() {
      Toast.loading({
        message: '正在提交...',
        forbidClick: true,
        duration: 0,
      });
      try {
        const {
          username,
          useWay,
          message,
          rate,
          productList,
          remark,
        } = this.data;
        const { result: res } = await wx.cloud.callFunction({
          name: 'review',
          data: {
            $url: 'addReview',
            username,
            useWay,
            message,
            rate,
            productList,
            remark,
          },
        });
        if (res.code === 0) {
          Toast.success('提交成功');
          this.setData({
            autosize: { minHeight: 70 },
            // 表单数据
            username: '',
            useWay: '',
            message: '',
            rate: '',
            productList: [
              {
                name: '',
                desc: '',
                model: '',
                peitao: '',
                caizhi: '',
                time: '',
                price: '',
                sell: '',
              },
            ],
            remark: '',
          });
        } else {
          Toast.fail('提交失败');
        }
      } catch (e) {
        Toast.fail('提交失败');
      }
    },
  },
});
