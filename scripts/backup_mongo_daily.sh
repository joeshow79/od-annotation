#/bin/bash

DB="image_label_database"

PATH="/workspace/mongodump/"

TS=`/bin/date "+%y_%m_%d_%H_%M_%S"`

/usr/bin/docker exec -d mongo mongodump -h localhost -d $DB -o $PATH/$TS/

