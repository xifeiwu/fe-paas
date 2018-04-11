/**
 * Created by xifei.wu on 2017/11/28.
 */
/* Automatically generated by './build/bin/build-entry.js' */

import 'element-ui/packages/theme-chalk/src/index.scss';
import 'assets/css/components-style-fix.scss';

import Pagination from 'element-ui/packages/pagination/index.js';
import Dialog from 'element-ui/packages/dialog/index.js';
// import Autocomplete from 'element-ui/packages/autocomplete/index.js';
// import Dropdown from 'element-ui/packages/dropdown/index.js';
// import DropdownMenu from 'element-ui/packages/dropdown-menu/index.js';
// import DropdownItem from 'element-ui/packages/dropdown-item/index.js';
import Menu from 'element-ui/packages/menu/index.js';
import Submenu from 'element-ui/packages/submenu/index.js';
import MenuItem from 'element-ui/packages/menu-item/index.js';
import MenuItemGroup from 'element-ui/packages/menu-item-group/index.js';
import Input from 'element-ui/packages/input/index.js';
import InputNumber from 'element-ui/packages/input-number/index.js';
import Radio from 'element-ui/packages/radio/index.js';
import RadioGroup from 'element-ui/packages/radio-group/index.js';
import RadioButton from 'element-ui/packages/radio-button/index.js';
import Checkbox from 'element-ui/packages/checkbox/index.js';
import CheckboxButton from 'element-ui/packages/checkbox-button/index.js';
import CheckboxGroup from 'element-ui/packages/checkbox-group/index.js';
import Switch from 'element-ui/packages/switch/index.js';
import Select from 'element-ui/packages/select/index.js';
import Option from 'element-ui/packages/option/index.js';
import OptionGroup from 'element-ui/packages/option-group/index.js';
import Button from 'element-ui/packages/button/index.js';
import ButtonGroup from 'element-ui/packages/button-group/index.js';
import Table from 'element-ui/packages/table/index.js';
import TableColumn from 'element-ui/packages/table-column/index.js';
import DatePicker from 'element-ui/packages/date-picker/index.js';
import TimeSelect from 'element-ui/packages/time-select/index.js';
import TimePicker from 'element-ui/packages/time-picker/index.js';
import Popover from 'element-ui/packages/popover/index.js';
import Tooltip from 'element-ui/packages/tooltip/index.js';
import MessageBox from 'element-ui/packages/message-box/index.js';
import Breadcrumb from 'element-ui/packages/breadcrumb/index.js';
import BreadcrumbItem from 'element-ui/packages/breadcrumb-item/index.js';
import Form from 'element-ui/packages/form/index.js';
import FormItem from 'element-ui/packages/form-item/index.js';
import Tabs from 'element-ui/packages/tabs/index.js';
import TabPane from 'element-ui/packages/tab-pane/index.js';
import Tag from 'element-ui/packages/tag/index.js';
// import Tree from 'element-ui/packages/tree/index.js';
import Alert from 'element-ui/packages/alert/index.js';
import Notification from 'element-ui/packages/notification/index.js';
// import Slider from 'element-ui/packages/slider/index.js';
import Loading from 'element-ui/packages/loading/index.js';
import Icon from 'element-ui/packages/icon/index.js';
import Row from 'element-ui/packages/row/index.js';
import Col from 'element-ui/packages/col/index.js';
import Upload from 'element-ui/packages/upload/index.js';
// import Progress from 'element-ui/packages/progress/index.js';
// import Spinner from 'element-ui/packages/spinner/index.js';
import Message from 'element-ui/packages/message/index.js';
import Badge from 'element-ui/packages/badge/index.js';
import Card from 'element-ui/packages/card/index.js';
// import Rate from 'element-ui/packages/rate/index.js';
import Steps from 'element-ui/packages/steps/index.js';
import Step from 'element-ui/packages/step/index.js';
// import Carousel from 'element-ui/packages/carousel/index.js';
import Scrollbar from 'element-ui/packages/scrollbar/index.js';
// import CarouselItem from 'element-ui/packages/carousel-item/index.js';
// import Collapse from 'element-ui/packages/collapse/index.js';
// import CollapseItem from 'element-ui/packages/collapse-item/index.js';
// import Cascader from 'element-ui/packages/cascader/index.js';
// import ColorPicker from 'element-ui/packages/color-picker/index.js';
// import Transfer from 'element-ui/packages/transfer/index.js';
import Container from 'element-ui/packages/container/index.js';
import Header from 'element-ui/packages/header/index.js';
import Aside from 'element-ui/packages/aside/index.js';
import Main from 'element-ui/packages/main/index.js';
import Footer from 'element-ui/packages/footer/index.js';
// import locale from 'element-ui/src/locale';
// import CollapseTransition from 'element-ui/src/transitions/collapse-transition';
const ClipBoard = require('components/clipboard');

const components = [
  Pagination,
  Dialog,
  // Autocomplete,
  // Dropdown,
  // DropdownMenu,
  // DropdownItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Table,
  TableColumn,
  DatePicker,
  TimeSelect,
  TimePicker,
  Popover,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  Form,
  FormItem,
  Tabs,
  TabPane,
  Tag,
  // Tree,
  Alert,
  Loading,
  // Slider,
  Icon,
  Row,
  Col,
  Upload,
  // Progress,
  // Spinner,
  Badge,
  Card,
  // Rate,
  Steps,
  Step,
  // Carousel,
  Scrollbar,
  // CarouselItem,
  // Collapse,
  // CollapseItem,
  // Cascader,
  // ColorPicker,
  // Transfer,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  // CollapseTransition,
  ClipBoard
];

const install = function(Vue, opts = {}) {
  /* istanbul ignore if */
  if (install.installed) return;
  // locale.use(opts.locale);
  // locale.i18n(opts.i18n);

  components.map(component => {
    // Vue.component(component.name, component);
    component.install(Vue);
});

  // Vue.use(Loading.directive);
  // Vue.prototype.$loading = Loading.service;
  //
  // const ELEMENT = {};
  // ELEMENT.size = opts.size || '';
  //
  Vue.prototype.$msgbox = MessageBox;
  Vue.prototype.$alert = MessageBox.alert;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$notify = Notification;
  Vue.prototype.$message = Message;
  //
  // Vue.prototype.$ELEMENT = ELEMENT;
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
};

let toExports = {
  version: '2.0.3',
  // locale: locale.use,
  // i18n: locale.i18n,
  install,
  // CollapseTransition,
  // Loading,
  // Pagination,
  // Dialog,
  // Autocomplete,
  // Dropdown,
  // DropdownMenu,
  // DropdownItem,
  // Menu,
  // Submenu,
  // MenuItem,
  // MenuItemGroup,
  // Input,
  // InputNumber,
  // Radio,
  // RadioGroup,
  // RadioButton,
  // Checkbox,
  // CheckboxButton,
  // CheckboxGroup,
  // Switch,
  // Select,
  // Option,
  // OptionGroup,
  // Button,
  // ButtonGroup,
  // Table,
  // TableColumn,
  // DatePicker,
  // TimeSelect,
  // TimePicker,
  // Popover,
  // Tooltip,
  // MessageBox,
  // Breadcrumb,
  // BreadcrumbItem,
  // Form,
  // FormItem,
  // Tabs,
  // TabPane,
  // Tag,
  // Tree,
  // Alert,
  // Notification,
  // Slider,
  // Icon,
  // Row,
  // Col,
  // Upload,
  // Progress,
  // Spinner,
  // Message,
  // Badge,
  // Card,
  // Rate,
  // Steps,
  // Step,
  // Carousel,
  // Scrollbar,
  // CarouselItem,
  // Collapse,
  // CollapseItem,
  // Cascader,
  // ColorPicker,
  // Transfer,
  // Container,
  // Header,
  // Aside,
  // Main,
  // Footer
};

// module.exports.default = module.exports;
export default toExports;