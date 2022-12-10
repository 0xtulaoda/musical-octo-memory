export default [
  {
    name: '推特监控',
    icon: 'icon-twitter',
    path: '/monitor',
    routes: [
      { path: '/monitor', redirect: '../monitor/TwitterScan/monitor' },
      {
        path: '/monitor/twitterScan/monitor',
        name: '监控列表',
        icon: 'smile',
        exact: true,
        component: './Monitor/TwitterScan/list',
      },
      {
        path: '/monitor/twitterScan/flow',
        name: '最新关注',
        icon: 'smile',
        exact: true,
        component: './Monitor/TwitterScan/flow-list',
      },
      {
        path: '/monitor/twitterScan/:followerOwnerId',
        name: '关注者列表',
        icon: 'smile',
        exact: true,
        hideInMenu: true,
        component: './Monitor/TwitterScan/follower-list',
      },
    ],
  },
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    name: 'Trade',
    icon: 'icon-twitter',
    path: '/swap',
    routes: [
      { path: '/swap', redirect: '../swap/1inch' },
      {
        path: '/swap/1inch',
        name: '1inch',
        icon: 'smile',
        exact: true,
        component: './swap/1inch',
      },
    ],
  },

  // {
  //   name: 'TRADE',
  //   icon: 'icon-twitter',
  //   path: '/trade',
  //   routes: [
  //     { path: '/monitor', redirect: '../trade/list' },
  //     {
  //       path: '/trade/order-list',
  //       name: '订单列表',
  //       icon: 'smile',
  //       exact: true,
  //       component: './Monitor/Twitter/list',
  //     },
  //   ],
  // },
  {
    path: '/',
    redirect: '/monitor',
  },
  {
    component: './404',
  },
];
