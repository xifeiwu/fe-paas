### 传统发版

backup:

rm fe-paas.dist.tar.gz && tar -zcvf fe-paas.dist.tar.gz fe-paas/dist

recovery:

rm fe-paas.dist.tar.gz && wget http://172.31.160.103:3000/fe-paas.dist.tar.gz
tar -zxvf fe-paas.dist.tar.gz


### docker打包及发版步骤

方式：本地打包，将镜像推送到harbor，服务端拉docker并执行

**登录harbor**

不论pull或push，都需要先登录harbor

docker login harbor.finupgroup.com

**打包**

yarn && git submodule init && git submodule upadte && npm run build

cd deploy/fe-paas
npm install
docker build -t harbor.finupgroup.com/galaxy/fe-paas:latest .

docker push harbor.finupgroup.com/galaxy/fe-paas:latest

调试：
docker-compose -f docker-compose-local.yaml run fe-paas sh


**运行**

cd deploy

生产灰度：docker-compose -f docker-compose-production-gray.yaml up -d fe-paas
生产：docker-compose -f docker-compose-production.yaml up -d fe-paas
测试：docker-compose -f docker-compose-test.yaml up -d fe-paas
本地：docker-compose -f docker-compose-local.yaml up -d fe-paas


**停止**

docker-compose -f docker-compose-test.yaml down

docker-compose -f docker-compose-test.yaml stop fe-paas

docker container stop 9aad52b14017(不建议)
