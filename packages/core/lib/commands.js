
const { log } = require('@man-cli-test/utils');
const fs = require('fs');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const semver = require('semver');
const dashify = require('dashify');
const getTemplate = require('./getTemplate');


const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

class Command {
  constructor(cmd, options, command) {
    this.cmd = cmd
    this.options = options
    this.command = command

    this.init()
    this.exec()
  }


  init() {
    this.projectName = this.cmd || '';
    this.force = this.options.force;
  }


  /**
   * 1.判断当前项目是否为空
   * 2.是否启动强制更新
   * 3.命令行选择创建项目
   * 4.获取项目的基本信息
  */
  async prepare() {
    // 这一步首先得判断项目是否存在模板，这是创建项目的前提
    const template = await getTemplate();
    console.log('template', template)
    if (!template || !template.length) {
      throw new Error('项目模板不存在');    // 就不往后面走了
    }
    this.template = template;
    const localPath = process.cwd();  // 当前执行命令所在目录
    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false;
      // 先判断是否带有force参数，如果是force，则不用询问是否创建项目而是直接进行
      if (!this.force) {
        // 是否继续创建项目
        ifContinue = (await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          default: false,
          message: '当前文件夹不为空，是否继续创建项目？'
        })).ifContinue;

        if (!ifContinue) return;
      }

      if (ifContinue || this.force) {
        // 确认是否要清空目录。因为清空一个已经存在的目录可能存在重要文件丢失的风险，所以需要确认。
        const { confirmEmpty } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmEmpty',
          default: false,
          message: '是否确认清空当前目录中的文件？'
        })

        if (confirmEmpty) {
          // 清空当前目录
          fse.emptyDirSync(localPath);    // 使用fs-extra中的emptyDirSync清空一个文件夹
        }
        // return confirmEmpty;
      }
    }
    return await this.getProjectInfo();
  }

  async getProjectInfo() {
    let projectInfo = {};
    let isValidProjectName = false;
    function isValidName(name) {
      return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][[a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(name)
    }
    if (isValidName(this.projectName)) {  // 如果初始化命令带有合格的项目名，则这个作为项目名，不再需要输入项目名的选项
      isValidProjectName = true;
      projectInfo.projectName = this.projectName;
    }

    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择创建类型',
      default: TYPE_PROJECT,
      choices: [
        {
          name: '项目',
          value: TYPE_PROJECT
        },
        {
          name: '组件',
          value: TYPE_COMPONENT
        }
      ]
    })

    const title = type === TYPE_PROJECT ? '项目' : '组件';

    this.template = this.template.filter(tem => tem.tags.includes(type)); // 根据所选类型作模板筛选

    const projectPrompt = [
      {
        type: 'input',
        name: 'projectVersion',
        message: `请输入${title}版本号`,
        default: '1.0.0',
        validate: function (v) {
          const done = this.async();
          setTimeout(function () {
            // 项目名称规则，可是是a,a1,ab,a-b,a_b,不能是a-,a_,ab-等
            if (!semver.valid(v)) {
              done('项目版本号不合格');
              return;
            }
            done(null, true);
          }, 0);
        },
        filter: function (v) {
          if (semver.valid(v)) {    //  注意semver.valid校验结果失败的时候返回null，filter不能返回null会出错，因此加上这里的判断。
            return semver.valid(v);
          } else {
            return v;
          }
        }
      }, {
        type: 'list',
        name: 'projectTemplate',
        message: `请选择${title}模板`,
        choices: this.createTemplateChoice()
      }
    ]

    const projectNamePrompt = {
      type: 'input',
      name: 'projectName',
      message: `请输入${title}名称`,
      default: '',
      validate: function (v) {
        const done = this.async();
        setTimeout(function () {
          // 项目名称规则，可是是a,a1,ab,a-b,a_b,不能是a-,a_,ab-等
          if (!isValidName(v)) {
            done(`${title}名称不合格`);
            return;
          }
          done(null, true);
        }, 0);
      }
    }
    // 如果初始化命令中带有合格的项目/组件名，则不需要在输入项目名的选项
    if (!isValidProjectName) projectPrompt.unshift(projectNamePrompt);
    if (type === TYPE_PROJECT) {
      const info = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        type,
        ...info
      }
    } else if (type === TYPE_COMPONENT) {
      // 如果是选的组件库则加上描述信息
      const descriptionPrompt = {
        type: 'input',
        name: 'description',
        message: '请输入组件描述',
        default: '',
        validate: function (v) {
          const done = this.async();
          setTimeout(function () {
            if (!v) {
              done('请输入组件描述信息');
              return;
            }
            done(null, true);
          }, 0);
        }
      }
      projectPrompt.push(descriptionPrompt)
      const info = await inquirer.prompt(projectPrompt);
      projectInfo = {
        ...projectInfo,
        type,
        ...info
      }
    }

    if (projectInfo.projectName) {
      projectInfo.name = dashify(projectInfo.projectName);  // 增加一个属性
      projectInfo.className = dashify(projectInfo.projectName)
    }
    projectInfo.version = projectInfo.projectVersion;     // 增加一个属性

    this.projectInfo = projectInfo;
    return projectInfo;
  }

  createTemplateChoice() {
    return this.template.map(item => ({
      value: item.npmName,
      name: item.name
    }))
  }

  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);  // 注意这个api用于读取文件夹内所有文件和文件夹名字，另外有一个叫做readFileSync
    // 对.git、node_modules等文件过滤
    fileList = fileList.filter(file => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0);
    return fileList.length === 0;
  }

  async exec() {

    /** 
     * 1.准备阶段
     * 2.下载模板
     * 3.安装模板
    */

    /**通过项目模板API获取项目模板信息：
     * 1.通过midway.js搭建一套后端系统
     * 2.通过npm存储项目模板
     * 3.将项目模板信息存储到mongodb数据库中
     * 4.通过midway.js获取mongodb中的数据并通过API返回
     */

    try {
      // 1.准备阶段
      const projectInfo = await this.prepare();
      console.log('projectInfo', projectInfo)
      if (projectInfo) {
        // 2.下载模板
        // await this.downloadTemplate();    // 这里为什么要加await？就是为了downloadTemplate内部出现错误的时候在这里能够捕获到，否则就需要在其内部再次捕获。这是async/await的特性
        // 3.安装模板
        // await this.installTemplate();
      }
    } catch (error) {
      log.error(error);
    }
  }
}

module.exports = Command; 
