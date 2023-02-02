import {File} from "runtime-compat/filesystem";
import fulfill from "./fulfill.js";
import flatten from "./flatten.js";

const last = -1;
const response = {
  code: 200,
  headers: {"Content-Type": "text/html"},
};

export default (strings, ...keys) => async conf => {
  const {paths: {components: path}, index} = conf;
  const loadFile = async file => [file.base, (await file.read())
    .replaceAll("\n", "")];
  const components = await path.exists
    ? Object.fromEntries(await Promise.all((
      await File.collect(`${path}`, ".html")).map(loadFile)))
    : {};
  const re = strings
    .slice(0, last)
    .map((string, i) => `${string}\${${i}}`)
    .join("") + strings[strings.length + last];
  const html = flatten(await fulfill(re, components, await Promise.all(keys)));
  const body = index.replace("<body>", () => `<body>${html}`);
  return {...response, body};
};
