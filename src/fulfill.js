import expand from "./expand.js";
import {PSEUDO, TAG, TEXT, makeTag, makeText} from "./parse.js";

const data_regex = /\${([^}]*)}/g;

const replace = async (attribute, source) => {
  const _source = await source;
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

const match = async (text, source) => {
  const matches = [...text.matchAll(data_regex)];
  if (matches.length > 0) {
    for (const match of matches) {
      const [key] = match;
      return await replace(match[1], source);
    }
  }
};

const _fulfill = async (template, source) => {
  if (source === undefined) {
    return template.replaceAll(data_regex, () => "");
  }
  let value = template;
  const matches = [...template.matchAll(data_regex)];
  if (matches.length > 0) {
    for (const match of matches) {
      const [key] = match;
      const new_value = await replace(match[1], source) ?? "";
      value = value.replace(key, new_value);
    }
  }
  return value;
}

const clone = (blueprint, _data) => {
  const cloned = blueprint.type === TAG ? makeTag(blueprint.tagName) : makeText();
  if (blueprint.attributes !== undefined) {
    for (const attribute in blueprint.attributes) {
      if (cloned.attributes === undefined) {
        cloned.attributes = {};
      };
      cloned.attributes[attribute] = blueprint.attributes[attribute];
    }
  }
  cloned._data = _data;
  if (blueprint.data !== undefined) {
    cloned.data = blueprint.data;
  }
  if (blueprint.children !== undefined) {
    for (const child of blueprint.children) {
      cloned.children.push(clone(child, _data));
    }
  }
  return cloned;
};

const fulfill = async node => {
  if (node.type === PSEUDO) {
    // nothing to fulfill, fulfill children
    for (const child of node.children) {
      await fulfill(child);
    }
    return node;
  }
  if (node.type === TAG) {
    // fulfill attributes 
    if (node.attributes !== undefined) {
      for (const [key, value] of Object.entries(node.attributes)) {
        if (key === "for") {
          const matches = await match(value, node._data);
          if (Array.isArray(matches)) {
            // delete the `for` attribute
            delete node.attributes[key];
            // clone n nodes to the tree with their children being this node's
            // children (in a div)
            const children = node.children;
            node.children = [];
            for (const match of matches) {
              const parent = makeTag("div");
              for (const child of children) {
                const fulfilled = await fulfill(clone(child, match));
                parent.children.push(fulfilled);
              }
              node.children.push(parent);
            }
          }
        } else {
          node.attributes[key] = await _fulfill(value, node._data);
          for (const child of node.children) {
            await fulfill(child);
          }
        }
      }
    } else {
      for (const child of node.children) {
        await fulfill(child);
      }
    }
    return node;
  }
  if (node.type === TEXT) {
    node.data = await _fulfill(node.data, node._data)
  }
  return node;
};

export default (html, components, data) =>
  fulfill(expand(html, components, data));
