import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  title: 'Defi Sniper',
  logo: '/logo.png',
  iconfontUrl: '//at.alicdn.com/t/font_2936829_t37o10rgb89.js',
  splitMenus: false,
  menu: {
    locale: false,
  },
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  pwa: false,
  headerHeight: 48,
  navTheme: 'light',
  primaryColor: '#1890ff',
  layout: 'top',
  // menuRender: false,
  // headerRender: false,
  // footerRender: false,
};
export default Settings;
