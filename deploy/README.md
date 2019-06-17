backup:

rm fe-paas.tar.gz && tar -zcvf fe-paas.tar.gz fe-paas/

recovery:

rm fe-paas.tar.gz && wget http://172.31.160.87:1024/fe-paas.tar.gz
tar -zxvf fe-paas.tar.gz

### docker build

1. 打包
docker-compose -f docker-compose-test.yaml  run --rm node-build 

2. build镜像
docker-compose -f docker-compose-test.yaml build spa-server

3. 运行
docker-compose -f docker-compose-test.yaml up -d spa-server

4. 停止

docker-compose -f docker-compose-test.yaml down

docker-compose -f docker-compose-test.yaml stop spa-server

docker container stop 9aad52b14017(不建议)
