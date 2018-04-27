#!/usr/bin/env python3
"""
A tool to find and remove duplicate pictures.

Usage:
    import_task.py add <path> ... [--db=<db_path>] --project=<project_name> [--parallel=<num_processes>]
    import_task.py remove <path> ... [--db=<db_path>] --project=<project_name>
    import_task.py clear [--db=<db_path>] --project=<project_name>
    import_task.py show [--db=<db_path>] --project=<project_name>
    import_task.py -h | --help

Options:
    -h, --help                Show this screen

    --db=<db_path>            [IMPORTANT] The location of the database or a MongoDB URI. (eg. mongodb://prcalc:27017)

    --project=<project_name>  [IMPORTANT] The name of the project, the name must be unique. The data of the same project should be save in the same collections. If project is not specified in command line, will be requested for user input.
    --parallel=<num_processes> The number of parallel processes to run to hash the image

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
import imagehash
from jinja2 import FileSystemLoader, Environment
from more_itertools import chunked
from PIL import Image, ExifTags
import pymongo
from termcolor import cprint

#DB_PATH = "mongodb://prcalc:27017/"
DB_PATH = "mongodb://localhost:27017/"
NUM_PROCESSES = psutil.cpu_count()

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


def get_image_files(path):
    """
    Check path recursively for files. If any compatible file is found, it is
    yielded with its full path.

    :param path:
    :return: yield absolute path
    """
    def is_image(file_name):
        # List mime types fully supported by Pillow
        full_supported_formats = ['gif', 'jp2', 'jpeg', 'pcx', 'png', 'tiff', 'x-ms-bmp',
                                  'x-portable-pixmap', 'x-xbitmap']
        try:
            mime = magic.from_file(file_name, mime=True)
            return mime.rsplit('/', 1)[1] in full_supported_formats
        except IndexError:
            return False

    path = os.path.abspath(path)
    for root, dirs, files in os.walk(path):
        for file in files:
            file = os.path.join(root, file)
            if is_image(file):
                yield file

def import_file(file):
    try:
        #img = Image.open(file)

        #file_size = get_file_size(file)
        #image_size = get_image_size(img)
        #capture_time = get_capture_time(img)
        cprint("\tImported {}".format(file), "blue")
        return file, -1, -1,"",-1,0
    except OSError:
        cprint("\tUnable to open {}".format(file), "red")
        return None

def import_files_parallel(files):
    with concurrent.futures.ProcessPoolExecutor(max_workers=NUM_PROCESSES) as executor:
        for result in executor.map(import_file, files):
            if result is not None:
                yield result

#def _add_to_database(file_, hash_, file_size, image_size, capture_time, db):
def _add_to_database(file_, category, sub_category, owner, status, finished_time,db):
    try:
        db.insert_one({"_id": file_,
                       "category": category,
                       "sub_category": sub_category,
                       "owner": owner,
                       "status": status,
                       "finished_time": finished_time})
    except pymongo.errors.DuplicateKeyError:
        cprint("Duplicate key: {}".format(file_), "red")


def _in_database(file, db):
    return db.count({"_id": file}) > 0


def new_image_files(files, db):
    for file in files:
        if _in_database(file, db):
            cprint("\tAlready importeded {}".format(file), "green")
        else:
            yield file


def add(paths, db):
    for path in paths:
        cprint("Add image {}".format(path), "blue")
        files = get_image_files(path)
        files = new_image_files(files, db)

        for result in import_files_parallel(files):
            _add_to_database(*result, db=db)

        cprint("...done", "blue")


def remove(paths, db):
    for path in paths:
        files = get_image_files(path)

        # TODO: Can I do a bulk delete?
        for file in files:
            remove_image(file, db)


def remove_image(file, db):
    db.delete_one({'_id': file})


def clear(db):
    db.drop()

def show(db):
    total = db.count()
    pprint(list(db.find()))
    print("Total: {}".format(total))

if __name__ == '__main__':
    from docopt import docopt
    args = docopt(__doc__)

    if args['--db']:
        DB_PATH = args['--db']

    if args['--project']:
        PROJECT_NAME=args['--project']

    if args['--parallel']:
        NUM_PROCESSES = int(args['--parallel'])

    cprint("[IMPORTANT!] Connect to project: "+PROJECT_NAME, "green")

    with connect_to_db(db_conn_string=DB_PATH,col=PROJECT_NAME) as db:
        if args['add']:
            add(args['<path>'], db)
        elif args['remove']:
            remove(args['<path>'], db)
        elif args['clear']:
            clear(db)
        elif args['show']:
            show(db)
