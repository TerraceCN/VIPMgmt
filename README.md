# VIPMgmt

会员管理系统

## 用法

请先复制`.sample.env`文件到`.env`，并按提示修改环境变量。

| 变量名        | 说明                                     | 可选 | 默认值                 |
| ------------- | ---------------------------------------- | ---- | ---------------------- |
| HTTP_PORT     | HTTP服务监听端口                         | 是   | 3000                   |
| DB_URL        | 数据库URL                                | 是   | sqlite://./database.db |
| JWT_SECRET    | HS256算法导出的JWK中的k字段，用于生成JWT | 否   |                        |
| SMTP_SERVER   | SMTP服务器地址                           | 否   |                        |
| SMTP_USERNAME | SMTP用户名（邮箱地址）                   | 否   |                        |
| SMTP_PASSWORD | SMTP密码                                 | 否   |                        |
| FRONT_URL     | 前端BASE_URL（不以”/“结尾）              | 否   |                        |

### 开发环境

```bash
yarn install
yarn dev
```

### 生产环境

1. 编译
    ```bash
    yarn install
    yarn build
    ```

2. 运行
    ```bash
    node dist/index.js
    ```

## 实现功能

### 数据库

- [x] 连接到MySQL数据库（兼容SQLite）
- [x] 密码加密存储

### 登录/注册

- [x] 登录功能
- [x] 注册功能
- [x] 忘记密码功能
- [x] 数据合法性验证

### 用户信息

- [x] 用户信息修改
- [x] 密码重置

### 会员管理

- [x] 会员查询
- [x] 会员分类筛选
- [x] 会员管理
- [x] 积分系统

### 数据分析
- [x] 总体积分变动总额
- [x] 总体积分变动次数
