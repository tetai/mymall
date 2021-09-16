## MySQL
安装MySQL，执行SQL脚本，修改配置文件

## nacos
安装启动
https://nacos.io/zh-cn/docs/quick-start-spring-boot.html

``` startup.cmd -m standalone ```

## RocketMQ
https://www.iocoder.cn/RocketMQ/start/install/?vip&gitee

下载，编译，启动

```
mvn -Prelease-all -DskipTests clean install -U

cd E:\devtool\mq\rocketmq-all-4.3.0-bin-release\bin

start mqnamesrv.cmd

start mqbroker.cmd -n 127.0.0.1:9876 autoCreateTopicEnable=true
```

## Redis

```
redis-server.exe

```



```