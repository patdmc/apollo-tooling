import { loadConfig } from "../";
import * as fs from "fs";

const makeNestedDir = dir => {
  if (fs.existsSync(dir)) return;

  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if (err.code == "ENOENT") {
      makeNestedDir(path.dirname(dir)); //create parent dir
      makeNestedDir(dir); //create dir
    }
  }
};

const deleteFolderRecursive = path => {
  // don't delete files on azure CI
  if (process.env.AZURE_HTTP_USER_AGENT) return;

  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const writeFilesToDir = (dir: string, files: Record<string, string>) => {
  Object.keys(files).forEach(key => {
    if (key.includes("/")) makeNestedDir(path.dirname(key));
    fs.writeFileSync(`${dir}/${key}`, files[key]);
  });
};

describe("loadConfig", () => {
  let dir, dirPath;
  beforeEach(() => {
    dir = fs.mkdtempSync("__tmp__");
    dirPath = `${process.cwd()}/${dir}`;
  });
  afterEach(() => {
    if (dir) deleteFolderRecursive(dir);
    dir = dirPath = undefined;
  });

  it("loads config", async () => {
    writeFilesToDir(dir, {
      "my.config.js": `
        module.exports = {
          client: {
            service: 'hello'
          }
        }
      `
    });

    const config = await loadConfig({
      configPath: dirPath,
      configFileName: "my.config.js"
    });
    // expect(config).toEqual();

    // expect(process.cwd()).toEqual();
    // expect(fs.readFileSync(`${dir}/test.txt`).toString()).toEqual();
  });
});
