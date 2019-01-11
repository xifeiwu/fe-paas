backup:

rm fe-paas.tar.gz && tar -zcvf fe-paas.tar.gz fe-paas/

recovery:

rm fe-paas.tar.gz && wget http://172.31.160.87:1024/fe-paas.tar.gz
tar -zxvf fe-paas.tar.gz
