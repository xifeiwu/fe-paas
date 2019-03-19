/* Automatically generated by './build/bin/build-entry.js' */

import Alert from 'element-ui/packages/alert/index.js';
import Autocomplete from 'element-ui/packages/autocomplete/index.js';
import Badge from 'element-ui/packages/badge/index.js';
import Breadcrumb from 'element-ui/packages/breadcrumb/index.js';
import BreadcrumbItem from 'element-ui/packages/breadcrumb-item/index.js';
import Button from 'element-ui/packages/button/index.js';
import ButtonGroup from 'element-ui/packages/button-group/index.js';
import Card from 'element-ui/packages/card/index.js';
import Checkbox from 'element-ui/packages/checkbox/index.js';
import CheckboxButton from 'element-ui/packages/checkbox-button/index.js';
import CheckboxGroup from 'element-ui/packages/checkbox-group/index.js';
import Col from 'element-ui/packages/col/index.js';
import DatePicker from 'element-ui/packages/date-picker/index.js';
import Dialog from 'element-ui/packages/dialog/index.js';
import Dropdown from 'element-ui/packages/dropdown/index.js';
import DropdownItem from 'element-ui/packages/dropdown-item/index.js';
import DropdownMenu from 'element-ui/packages/dropdown-menu/index.js';
import Form from 'element-ui/packages/form/index.js';
import FormItem from 'element-ui/packages/form-item/index.js';
import Input from 'element-ui/packages/input/index.js';
import InputNumber from 'element-ui/packages/input-number/index.js';
import Loading from 'element-ui/packages/loading/index.js';
import Menu from 'element-ui/packages/menu/index.js';
import MenuItem from 'element-ui/packages/menu-item/index.js';
import MenuItemGroup from 'element-ui/packages/menu-item-group/index.js';
import Message from 'element-ui/packages/message/index.js';
import MessageBox from 'element-ui/packages/message-box/index.js';
import Notification from 'element-ui/packages/notification/index.js';
import Option from 'element-ui/packages/option/index.js';
import OptionGroup from 'element-ui/packages/option-group/index.js';
import Pagination from 'element-ui/packages/pagination/index.js';
import Popover from 'element-ui/packages/popover/index.js';
import Radio from 'element-ui/packages/radio/index.js';
import RadioGroup from 'element-ui/packages/radio-group/index.js';
import RadioButton from 'element-ui/packages/radio-button/index.js';
import Row from 'element-ui/packages/row/index.js';
import Scrollbar from 'element-ui/packages/scrollbar/index.js';
import Select from 'element-ui/packages/select/index.js';
import Slider from 'element-ui/packages/slider/index.js';
import Step from 'element-ui/packages/step/index.js';
import Steps from 'element-ui/packages/steps/index.js';
import Submenu from 'element-ui/packages/submenu/index.js';
import Switch from 'element-ui/packages/switch/index.js';
import Table from 'element-ui/packages/table/index.js';
import TableColumn from 'element-ui/packages/table-column/index.js';
import TabPane from 'element-ui/packages/tab-pane/index.js';
import Tabs from 'element-ui/packages/tabs/index.js';
import Tag from 'element-ui/packages/tag/index.js';
import TimePicker from 'element-ui/packages/time-picker/index.js';
import TimeSelect from 'element-ui/packages/time-select/index.js';
import Tooltip from 'element-ui/packages/tooltip/index.js';
import Tree from 'element-ui/packages/tree/index.js';
import Upload from 'element-ui/packages/upload/index.js';
// import locale from 'element-ui/src/locale';
import CollapseTransition from 'element-ui/src/transitions/collapse-transition';

const components = [
  Alert,
  Autocomplete,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Col,
  DatePicker,
  Dialog,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form,
  FormItem,
  Input,
  InputNumber,
  Menu,
  MenuItem,
  MenuItemGroup,
  Option,
  OptionGroup,
  Pagination,
  Popover,
  Radio,
  RadioGroup,
  RadioButton,
  Row,
  Scrollbar,
  Select,
  Slider,
  Step,
  Steps,
  Submenu,
  Switch,
  Table,
  TableColumn,
  TabPane,
  Tabs,
  Tag,
  TimePicker,
  TimeSelect,
  Tooltip,
  Tree,
  Upload,
  CollapseTransition
];

const install = function(Vue, opts = {}) {
  // locale.use(opts.locale);
  // locale.i18n(opts.i18n);

  components.forEach(component => {
    Vue.component(component.name, component);
  });

  Vue.use(Loading.directive);

  Vue.prototype.$ELEMENT = {
    size: opts.size || '',
    zIndex: opts.zIndex || 2000
  };

  Vue.prototype.$loading = Loading.service;
  Vue.prototype.$msgbox = MessageBox;
  Vue.prototype.$alert = MessageBox.alert;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$notify = Notification;
  Vue.prototype.$message = Message;

};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

module.exports = {
  version: '1.0.0',
  // locale: locale.use,
  // i18n: locale.i18n,
  install,
  CollapseTransition,
  Loading,
  Alert,
  Autocomplete,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Col,
  DatePicker,
  Dialog,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Form,
  FormItem,
  Input,
  InputNumber,
  Menu,
  MenuItem,
  MenuItemGroup,
  Message,
  MessageBox,
  Notification,
  Option,
  OptionGroup,
  Pagination,
  Popover,
  Radio,
  RadioGroup,
  RadioButton,
  Row,
  Scrollbar,
  Select,
  Slider,
  Step,
  Steps,
  Submenu,
  Switch,
  Table,
  TableColumn,
  TabPane,
  Tabs,
  Tag,
  TimePicker,
  TimeSelect,
  Tooltip,
  Tree,
  Upload
};

module.exports.default = module.exports;
