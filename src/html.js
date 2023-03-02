import {Path, File} from "runtime-compat/filesystem";
import fulfill from "./fulfill.js";
import flatten from "./flatten.js";

const last = -1;
const response = {
  status: 200,
  headers: {"Content-Type": "text/html"},
};

const index_html = "index.html";
const preset = await new Path(import.meta.url).directory.join(index_html).file
  .read();

const getIndex = async conf => {
  try {
    return await File.read(`${conf.paths.static.join(index_html)}`);
  } catch (error) {
    return preset;
  }
};

export default (strings, ...keys) => async conf => {
  const index = await getIndex(conf);
  const {paths: {components: path}} = conf;
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
