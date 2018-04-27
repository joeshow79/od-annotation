import codecs
import hashlib
import json
import threading
import time
import os
import argparse
import traceback
import requests
import datetime
import random
from flask import Flask, render_template, jsonify, send_file
from flask import request
from logger_manager import controller_logger as logger

import config_wa as sys_config
import utils.tool_wa as tool

from flask_pymongo import PyMongo


app = Flask(__name__)
app.config.from_object('config')

# connect to another MongoDB server altogether
app.config['MONGOWA_HOST'] = sys_config.DB_HOST
app.config['MONGOWA_PORT'] = sys_config.DB_PORT
app.config['MONGOWA_DBNAME'] = sys_config.DB_NAME
app.config['MONGOWA_CONNECT'] = False

mu = threading.Lock()  # 创建一个锁

mongo = PyMongo(app, config_prefix='MONGOWA')

# Route to any template
@app.route('/')
def index():
    return render_template('index_wa.html', \
                           sample_type=sys_config.SAMPLE_FILE_TYPE)


@app.route('/<template>')
def route_template(template):
    return render_template(template)


# 读取类别标签
@app.route('/api/annotation/labels', methods=['GET'])
def get_labels():
    label_json = tool.get_labels()
    result = dict()
    result['message'] = 'success'
    result['data'] = label_json
    return jsonify(result)


# 读取标注样本
@app.route('/api/annotation/next', methods=['GET'])
def get_next():
    print("next...\n")
    img_name=""
    sample_count=mongo.db[sys_config.PROJECT_NAME].find({'status': -1}).count()

    #random selection
    if sample_count > 10:
        cursor=mongo.db[sys_config.PROJECT_NAME].find({'status': -1},{'_id':1}).limit(10)
        cursor.skip(random.randint(0,9))
        sample_to_label = next(cursor, None)
        img_name = sample_to_label['_id']
    else:
        for sample_to_label in mongo.db[sys_config.PROJECT_NAME].find({'status': -1},{'_id':1}).limit(1):
            img_name = sample_to_label['_id']

    print(img_name)

    result = dict()
    result['img_name'] = img_name
    result['sample_count'] = sample_count 
    return jsonify(result)

# 读取标注样本
@app.route('/api/annotation/sample', methods=['GET'])
def get_sample():
    if 'img_name' in request.args:
        img_name = request.args['img_name'] 

    print("sample....\n")
    print(img_name)

    if img_name:
        logger.debug('Processing:' + str(img_name))
        return send_file(img_name, mimetype='application/octet-stream', as_attachment=True, attachment_filename=img_name)
    else:
        result = dict()
        result['message'] = 'failure'
        return jsonify(result)


# 标注接口
@app.route('/api/annotation/save', methods=['POST'])
def save_annotation():
    img_name = request.form['img_name'] 
    tags = request.form['tags']

    print("save....\n")
    print(img_name)
    try:
        if mu.acquire(True):
            mongo.db[sys_config.PROJECT_NAME].save({"_id": img_name, 
                       "category": tags, 
                       "sub_category": -1,
                       "owner": "",
                       "status": 1,
                       "finished_time": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')})
            mu.release()
    except Exception as e:
        print(e)
    result = dict()
    result['message'] = 'success'
    return jsonify(result)


# Errors
@app.errorhandler(403)
def not_found_error(error):
    return render_template('page_403.html'), 403


@app.errorhandler(404)
def not_found_error(error):
    return render_template('page_404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    return render_template('page_500.html'), 500


def run():
    app.run(debug=sys_config.DEBUG, host='0.0.0.0', port=sys_config.SERVER_PORT, threaded=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Object detection annotation service.')
    parser.add_argument('--start', action='store_true', help='running background')
    parser.add_argument('--stop', action='store_true', help='shutdown process')
    parser.add_argument('--restart', action='store_true', help='restart process')
    #parser.add_argument('--convert2voc', action='store_true', help='restart process')

    FLAGS = parser.parse_args()
    if FLAGS.start:
        tool.start_service(run, sys_config.PID_FILE)
    elif FLAGS.stop:
        tool.shutdown_service(sys_config.PID_FILE)
    elif FLAGS.restart:
        tool.shutdown_service(sys_config.PID_FILE)
        tool.start_service(run, sys_config.PID_FILE)
    #elif FLAGS.convert2voc:
        #tool.convert_to_voc2007()
