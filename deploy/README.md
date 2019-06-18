### 传统发版

backup:

rm fe-paas.tar.gz && tar -zcvf fe-paas.tar.gz fe-paas/

recovery:

rm fe-paas.tar.gz && wget http://172.31.160.87:1024/fe-paas.tar.gz
tar -zxvf fe-paas.tar.gz


### docker打包及发版步骤

方式：本地打包，将镜像推送到harbor，服务端拉docker并执行


**打包**

yarn && git submodule init && git submodule upadte && npm run build

cd deploy/fe-paas
npm install
docker build -t harbor.finupgroup.com/galaxy/fe-paas:latest .

docker push harbor.finupgroup.com/galaxy/fe-paas:latest

调试：
docker-compose -f docker-compose-local.yaml run spa-server sh


**运行**
cd deploy

生产灰度：docker-compose -f docker-compose-production-gray.yaml up -d spa-server
生产：docker-compose -f docker-compose-production.yaml up -d spa-server
测试：docker-compose -f docker-compose-production.yaml up -d spa-server


**停止**

docker-compose -f docker-compose-test.yaml down

docker-compose -f docker-compose-test.yaml stop spa-server

docker container stop 9aad52b14017(不建议)
