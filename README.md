# 目标检测数据集标注工具

采用python-flask框架开发，基于B/S方式交互，支持多人同时标注。

## （丑陋的）界面效果图
![](docs/ui2.png)

## 特点
* B/S方式交互
* 支持多人同时标注（可分配不同标注人员的标注范围，或不同人员标注不同类别）
* 类别采用选择方式，免去手工输入类别工作
* 支持拖拽方式修正标注区域
* 支持键盘方向键切换标注样本
* 支持多类别多目标标注


## 使用方法
1. 根据`requirements.txt`安装环境依赖
```buildoutcfg
$ cd od-annotation
$ pip3 install -r requirements.txt
```
2. 重命名标注样本，采用前导0方式编号，共6位(000001-0000xx)，注意保持样本编号连续。
3. 编辑`annotation/label_config.txt`文件，根据格式配置标签
```buildoutcfg
# 标签名称:标签描述
dog:狗
```
4. 编辑`config.py`,根据样本实际情况修改：
```buildoutcfg
SAMPLE_FILE_TYPE = 'jpg'  # 样本图片格式
SAMPLE_FILE_PATH = 'your samples directory path'  # 样本图片存放目录
```
4. 启动/停止/重启标注工具：
```buildoutcfg
$ cd od-annotation
$ python3 app_wa.py --start|stop|restart
```
5. 访问`http://localhost:5000`开始标注。先选定待标注类别，然后按住鼠标左键并拖拽鼠标在目标区域绘制矩形框进行标注，松开鼠标完成标注。可拖动矩形框以修正坐标，右击某矩形框可取消该标注。每次新绘制矩形框、拖动已有矩形框或右击取消矩形框时，会在下方的`当前样本标注状态`文本框中同步更新该样本的标注结果。
6. 点击左右方向按钮或通过键盘方向键切换标注样本。切换时自动提交标注结果，同时在`所有样本标注状态`文本框中更新当前样本的标注结果。或手动点击`保存`按钮提交标注结果。
7. 所有样本标注完成后，若需要转换成VOC2007格式，执行：
```buildoutcfg
$ cd od-annotation
$ python3 app_wa.py --convert2voc
```
查看`annotation/VOC2007`目录下相关文件夹是否生成对应文件

## 说明
* 依赖python3
* 标注数据在`annotation/annotation.txt`文件中，每行一条标注数据，格式为`filename,x1,y1,x2,y2,classname`，x1,y1,x2,y2分别表示左上角和右下角坐标


## 已知Bug
* 绘制区域再选择对应类别，然后切换样本时会导致类别单选框状态跟着切换（临时解决方法：通过点击页面空白区域来取消单选框焦点以避免bug）





----------------------------------------------------

#Script
# Duplicate Image Importer/Finder

This Python script finds duplicate images using a [perspective hash (pHash)](http://www.phash.org) to compare images. pHash ignores the image size and file size and instead creates a hash based on the pixels of the image. This allows you to find duplicate pictures that have been rotated, have changed metadata, and slightly edited.

This script hashes images added to it, storing the hash into a database (MongoDB). To find duplicate images, hashes are compared. If the hash is the same between two images, then they are marked as duplicates. A web interface is provided to delete duplicate images easily. If you are feeling lucky, there is an option to automatically delete duplicate files.

As a word of caution, pHash is not perfect. I have found that duplicate pictures sometimes have different hashes and similar (but not the same) pictures have the same hash. This script is a great starting point for cleaning your photo library of duplicate pictures, but make sure you look at the pictures before you delete them. You have been warned! I hold no responsibility for any family memories that might be lost because of this script.

This script has only been tested with Python 3 and is still pretty rough around the edges. Use at your own risk.

## Requirements

This script requires MongoDB, Python 3.4 or higher, and a few Python modules, as found in `requirements.txt`.


## Quick Start

I suggest you read the usage, but here are the steps to get started right away. These steps assume that MongoDB is already installed on the system.

First, install this script. This can be done by either cloning the repository or [downloading the script](https://github.com/philipbl/duplicate-images/archive/master.zip).
```bash
git clone https://github.com/joeshow79/duplicate-images.git
```

Next, download all required modules. This script has only been tested with Python 3. I would suggest that you make a virtual environment, setting Python 3 as the default python executable (`mkvirtualenv --python=/usr/local/bin/python3 <name>`)
```bash
pip install -r requirements.txt
```

Last, run script:
```bash
python annotation_task_manager.py
```

## Example

```bash

# Add your pictures to the database
# (this will take some time depending on the number of pictures)
python annotation_task_manager.py add ~/Pictures
python annotation_task_manager.py add /Volumes/Pictures/Originals /Volumes/Pictures/Edits

# Find duplicate images
# A webpage will come up with all of the duplicate pictures
python annotation_task_manager.py find
```

## Usage

```bash
Usage:
    annotation_task_manager.py add <path> ... [--db=<db_path>] --project=<project_name> [--parallel=<num_processes>]
    annotation_task_manager.py remove <path> ... [--db=<db_path>] --project=<project_name>
    annotation_task_manager.py clear [--db=<db_path>] --project=<project_name>
    annotation_task_manager.py show [--db=<db_path>] --project=<project_name>
    annotation_task_manager.py find [--print] [--delete] [--match-time] [--trash=<trash_path>] [--db=<db_path>] --project=<project_name>
    annotation_task_manager.py -h | --help

Options:
    -h, --help                Show this screen

    --db=<db_path>            [IMPORTANT] The location of the database or a MongoDB URI. (eg. mongodb://prcalc:27017)

    --project=<project_name>  [IMPORTANT] The name of the project, the name must be unique. The data of the same project should be save in the same collections. If project is not specified in command line, will be requested for user input.

    --parallel=<num_processes> The number of parallel processes to run to hash the image
                               files (default: number of CPUs).

    find:
        --print               Only print duplicate files rather than displaying HTML file
        --delete              Move all found duplicate pictures to the trash. This option takes priority over --print.
        --match-time          Adds the extra constraint that duplicate images must have the
                              same capture times in order to be considered.
        --trash=<trash_path>  Where files will be put when they are deleted (default: ./Trash)
```

### Add hash records of images to the collection named 'vision'
```bash
python annotation_task_manager.py add /path/to/images --project=vision
```

When a path is added, image files are recursively searched for. In particular, `JPEG`, `PNG`, `GIF`, and `TIFF` images are searched for. Any image files found will be hashed. Adding a path uses 8 processes (by default) to hash images in parallel so the CPU usage is very high.

### Remove hash records of images from the collection named 'vision'
```bash
python annotation_task_manager.py remove /path/to/images --project=vision
```

A path can be removed from the database. Any image inside that path will be removed from the database.

### Clear hash records of images from the collection named 'vision'
```bash
python annotation_task_manager.py clear --project=vision
```

Removes all hashes from the database.

### Show the records of images from the collection named 'vision'
```bash
python annotation_task_manager.py show --project=vision
```

Prints the contents database.

### Find the duplicated images from the collection named 'vision'
```bash
annotation_task_manager.py find [--print] [--delete] [--match-time] [--trash=<trash_path>] --project=vision
```

Finds duplicate pictures that have been hashed. This will find images that have the same hash stored in the database. There are a few options associated with `find`. By default, when this command is run, a webpage is displayed showing duplicate pictures and a server is started that allows for the pictures to be deleted (images are not actually deleted, but moved to a trash folder -- I really don't want you to make a mistake). The first option, **`--print`**, prints all duplicate pictures and does not display a webpage or start the server. **`--delete`** automatically moves all duplicate images found to the trash. Be careful with this one. **`--match-time`** adds the extra constraint that images must have the same EXIF time stamp to be considered duplicate pictures. Last, `--trash=<trash_path>` lets you select a path to where you want files to be put when they are deleted. The default trash location is `./Trash`.

## Disclaimer

I take no responsibility for bugs in this script or accidentally deleted pictures. Use at your own risk. Make sure you back up your pictures before using.
