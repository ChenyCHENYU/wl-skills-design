# Sub-02 — 影响矩阵

## 目标

逐域判断变更影响，不遗漏 spec / glossary / DB / API / prototype / review。

## 判断顺序

1. 先判断 glossary：是否涉及命名、枚举、编码
2. 再判断 spec：IPO、处理逻辑、状态机、画面对照
3. 再判断 DB：字段、枚举、索引、默认值、DDL
4. 再判断 API：请求/响应、错误码、幂等、安全
5. 再判断 prototype：字段、按钮、显隐、文案
6. 最后判断 review：需要哪些复验项

## 输出列

| 域 | 影响等级 | 原因 | 需改文件 | 责任 Skill | 复验入口 |

无影响必须写 NA 理由。
