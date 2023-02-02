import {default as parse, PSEUDO} from "./parse.js";

const data_regex = /\${([^}]*)}/g;

const replace = (attribute, source) => {
  const _source = source;
  if (attribute.includes(".")) {
    const index = attribute.indexOf(".");
    const left = attribute.slice(0, index);
    const rest = attribute.slice(index + 1);
    if (source[left] !== undefined) {
      return replace(rest, _source[left]);
    }
  } else {
    return _source[attribute];
  }
};

const match = (text, source) => {
  const matches = [...text.matchAll(data_regex)];
  if (matches.length > 0) {
    for (const match of matches) {
      return replace(match[1], source);
    }
  }
};

const expand = (tree, components, slots) => {
  if (tree.children !== undefined) {
    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];
      // children generally carry their parents data, if they don't have _data
      // of their own
      if (child._data === undefined) {
        child._data = tree._data
      }
      if (components[child.tagName] !== undefined) {
        let expanded;
        // components only carry declared attributes as data
        if (child.attributes !== undefined && tree._data !== undefined) {
          let _data = {};
          for (const attribute in child.attributes) {
            _data[attribute] = match(child.attributes[attribute], tree._data);
          }
          const parsed = parse(components[child.tagName]);
          parsed._data = _data;
          const slots = tree.children[i].children;
          for (const slot of slots) {
            slot._data = child._data;
          }
          expanded = expand(parsed, components, slots);
        } else {
          const parsed = parse(components[child.tagName]);
          const slots = tree.children[i].children;
          for (const slot of slots) {
            slot._data = child._data;
          }
          expanded = expand(parsed, components, slots);
        }
        tree.children[i] = expanded;
        if (tree.children[i].attributes === undefined) {
          tree.children[i].attributes = {};
        }
      } else {
        if (child.tagName === "slot" && slots !== undefined) {
          // insert slot
          tree.children[i] = {type: PSEUDO, children: slots};
          expand(tree.children[i], components);
        } else {
          expand(tree.children[i], components, slots);
        }
      }
    }
  }
  return tree;
};

export default (html, components, data) => {
  const parsed = parse(html);
  parsed._data = data;
  return expand(parsed, components);
};
