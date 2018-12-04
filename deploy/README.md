backup:

tar -zcvf fe-paas.tar.gz fe-paas/

recovery:

wget http://172.31.160.87:1024/fe-paas.tar.gz
tar -zxvf fe-paas.tar.gz
