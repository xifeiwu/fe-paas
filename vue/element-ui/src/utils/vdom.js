import { hasOwn } from 'element-ui/src/utils/util';

export function isVNode(node) {
  return null != node && typeof node === 'object' && hasOwn(node, 'componentOptions');
};

export function getFirstComponentChild(children) {
  return children && children.filter(c => c && c.tag)[0];
};
