import {Path, File} from "runtime-compat/filesystem";

const meta_url = new Path(import.meta.url).path;
const directory = Path.directory(meta_url);
const preset = `${directory}/preset`;

export default class Bundler {
  constructor(conf) {
    this.conf = conf;
    this.debug = conf.debug;
    this.index = conf.files.index;
    this.scripts = [];
  }

  async bundle() {
    const {paths} = this.conf;
    console.log("test2", paths);
    // remove public directory in case exists
    if (await paths.public.exists) {
      await paths.public.file.remove();
    }
    await paths.public.file.create();

    if (await paths.static.exists) {
      // copy static files to public
      await File.copy(paths.static, paths.public);
    }

    const index = paths.public.join(this.index);
    if (await index.exists) {
      // read index.html from public, then remove it (we serve it dynamically)
      await index.remove();
    }
  }
}

export const index = async conf => {
  let file;
  const subdirectory = "static";
  try {
    file = await File.read(`${conf.paths[subdirectory]}/${conf.files.index}`);
  } catch (error) {
    file = await File.read(`${preset}/${subdirectory}/${conf.files.index}`);
  }
  return file;
};
