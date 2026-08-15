# Sub-Skill 01 — 采集与归位

> 目标：把任意形态的既有设计材料变成可分析的结构化集合。只读，不修改源文件。

## 步骤

### 1. 清点输入

逐个读入用户给出的路径或目录，登记：文件名、类型（md / drawio / sql / yaml / json / docx 说明）、体量、最后修改时间。docx/xlsx 等二进制格式只登记并在报告中声明「需人工导出为文本」。

### 2. 按编码体系分类

用以下锚点把内容归位到五类规范文件：

| 锚点 | 归位目标 |
|------|---------|
| `【功能编码】`、IPO、处理逻辑 | `docs/spec/{代号}/4.x-{子模块}.md` |
| 系统目标、岗位、术语、功能层级 | `docs/spec/{代号}/ch1-3.md` |
| CREATE TABLE、数据字典、10 列字段表 | `docs/db/` |
| 接口清单、报文字段表、openapi | `docs/api/` |
| mxfile / mxGraphModel | `docs/flowchart/` |

### 3. 提取编码集合

全文提取：流程编码 `[A-Z]+-A-\d{2}`、活动编码、功能编码 `【…】`、表名、字典值、operationId。这些集合是差距分析和铸造模型的基础。

### 4. 未归类区

无法识别的片段（散文式需求、截图、会议记录）列入「未归类区」，注明来源和疑似归属域；不得猜测后混入正文。

### 5. 铸造 draft design-model

从编码集合生成 `docs/design-model.json` 草稿：fields/functions/flows/screens/tables/apis 按稳定 ID 规则登记，`source.path` 指向归位后的文件。编码不足的域留空数组。草稿先展示，确认后才落盘。
