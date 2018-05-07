# -*- coding: UTF-8 -*-
import os

basedir = os.path.abspath(os.path.dirname(__file__))

# Flask
DEBUG = True

# 日志配置
LOG_DIR = os.path.join(basedir, 'logs')
LOG_FORMAT = '%(asctime)s %(levelname)s: %(message)s [in %(module)s.%(funcName)s:%(lineno)d]'
LOG_LEVEL = 'info'

# 节点配置
PID_FILE = 'od-annotation.pid'
SERVER_PORT = 5000

# 标注配置
SAMPLE_TYPE_SET = ['jpg', 'jpeg', 'png', 'bmp']
SAMPLE_FILE_TYPE = 'jpg'  # 样本图片格式
SAMPLE_FILE_PATH = '/src/portrait'  # 样本图片存放目录

DB_PATH = "mongodb://localhost:27017/"
#DB_HOST = "localhost"
DB_HOST = "mongo"
DB_PORT = "27017"
DB_NAME = "image_label_database"

PROJECT_NAME="vision"
