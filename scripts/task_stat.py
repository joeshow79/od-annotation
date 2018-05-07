#!/usr/bin/env python3
"""
A tool to do the statistic for each day

Usage:
    task_stat.py stat [--db=<db_path>] --project=<project_name> [--since=<since time>]
    task_stat.py -h | --help

Options:
    -h, --help                Show this screen

    --db=<db_path>            [IMPORTANT] The location of the database or a MongoDB URI. (eg. mongodb://prcalc:27017)

    --project=<project_name>  [IMPORTANT] The name of the project, the name must be unique. The data of the same project should be save in the same collections. If project is not specified in command line, will be requested for user input.

    --since=<since time>            [IMPORTANT] The time since to do statistic, default is 1970-01-01 00:00:00


examples:
    1.
    python scripts/task_stat.py stat --project=vision --since "2018-05-01 00:00:00"

"""

import concurrent.futures
from contextlib import contextmanager
import os
import magic
import math
from pprint import pprint
import psutil
import shutil
from subprocess import Popen, PIPE, TimeoutExpired
from tempfile import TemporaryDirectory
import webbrowser

from flask import Flask
from flask_cors import CORS
import imagehash
from jinja2 import FileSystemLoader, Environment
from more_itertools import chunked
from PIL import Image, ExifTags
import pymongo
from termcolor import cprint
import datetime
import codecs

TRASH = "./Trash/"
#DB_PATH = "mongodb://prcalc:27017/"
DB_PATH = "mongodb://localhost:27017/"
NUM_PROCESSES = psutil.cpu_count()
SINCE_TIME =  "1970-01-01 00:00:00"

@contextmanager
def connect_to_db(db_conn_string,col):
    p = None

    # Determine db_conn_string is a mongo URI or a path
    # If this is a URI
    if 'mongodb://' == db_conn_string[:10]:
        client = pymongo.MongoClient(db_conn_string)
        cprint("Connected server...", "yellow")
        db = client.image_label_database
        images = db[col]

    # If this is not a URI
    else:
        if not os.path.isdir(db_conn_string):
            os.makedirs(db_conn_string)

        p = Popen(['mongod', '--dbpath', db_conn_string], stdout=PIPE, stderr=PIPE)

        try:
            p.wait(timeout=2)
            stdout, stderr = p.communicate()
            cprint("Error starting mongod", "red")
            cprint(stdout.decode(), "red")
            exit()
        except TimeoutExpired:
            pass

        cprint("Started database...", "yellow")
        client = pymongo.MongoClient()
        db = client.image_database
        images = db.images

    yield images

    client.close()

    if p is not None:
        cprint("Stopped database...", "yellow")
        p.terminate()


def stat(db,since):
    dups = db.aggregate([
        {
        "$match": {
            "status":1,"finished_time": {"$gt": since}
            }
        },
        {
        "$group": {
            "_id": "$owner",
            "total": {"$sum": 1},
            }
        }
    ])

    pprint(list(dups))


if __name__ == '__main__':
    from docopt import docopt
    args = docopt(__doc__)

    if args['--db']:
        DB_PATH = args['--db']

    if args['--project']:
        PROJECT_NAME=args['--project']

    if args['--since']:
        SINCE_TIME=args['--since']

    cprint("[IMPORTANT!] Connect to DB: "+DB_PATH, "green")
    cprint("[IMPORTANT!] Connect to project: "+PROJECT_NAME, "green")
    cprint("[IMPORTANT!] Since: "+SINCE_TIME, "green")

    with connect_to_db(db_conn_string=DB_PATH,col=PROJECT_NAME) as db:
        if args['stat']:
            stat(db,SINCE_TIME)
