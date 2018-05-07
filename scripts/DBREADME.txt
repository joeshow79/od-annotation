[BACKUP]
>mongodump -h dbhost -d dbname -o dbdirectory
e.g: mongodump -h localhost -d image_label_database -o dbdirectory


[RESTORE]
>mongorestore -h <hostname><:port> -d dbname <path>
e.g: mongorestore -h localhost -d image_label_database  dbdirectory

