# spec-gen — Python 需求设计说明书生成流水线

本目录包含基于 Python + python-docx 的 Word 文档自动生成工具，
独立于 npm 包主体，**不会发布到 npm**。

---

## 目录结构

```
spec-gen/
├── README.md               本文档
│
├── scripts/                Python 源码（受 git 追踪）
│   ├── generate_spec_doc.py   ★ 主生成器 — 运行此文件生成 Word 文档
│   ├── draw_flow.py           流程图双轨生成模块（PNG + drawio XML）
│   └── create_skeleton.py    一次性骨架提取工具（已完成使命，勿重复运行）
│
├── templates/              ⚠️ 只读模板区（受 git 追踪，禁止脚本写入）
│   └── template_skeleton.docx   Word 格式骨架（封面 + 目录结构 + 所有样式）
│
├── output/                 生成物（.gitignored，不入 git）
│   ├── 华新计划模块需求设计说明书_v2.0.docx
│   └── assets/             中间图片资源
│       ├── PMPM-A-01.png       流程图（Pillow 渲染）
│       ├── PMPM-A-01.drawio    流程图（可用 draw.io 编辑）
│       └── PMPM00x_prototype.png  UI 占位图
│
└── analysis/               分析报告（受 git 追踪，作为参考资料）
    └── doc_deep_analysis.txt    原版文档深度解析结果
```

---

## 快速开始

```bash
# 确认依赖已安装
pip install python-docx Pillow

# 生成文档（从 spec-gen/ 根目录运行）
python scripts/generate_spec_doc.py

# 生成物位置
#   spec-gen/output/华新计划模块需求设计说明书_v2.0.docx
#   spec-gen/output/assets/PMPM-A-01.png
#   spec-gen/output/assets/PMPM-A-01.drawio
```

---

## ⚠️ 模板保护规则

| 目录 | 属性 | 说明 |
|------|------|------|
| `templates/` | **只读**（受 git 追踪） | 由 `create_skeleton.py` 一次性生成后固化，任何脚本**不得**覆盖 |
| `output/` | 可写（.gitignored） | 所有生成物写入此处，不入 git，不污染模板 |
| `scripts/` | 可写（受 git 追踪） | Python 源码，可自由修改 |
| `analysis/` | 只读（受 git 追踪） | 参考资料，不应被脚本覆盖 |

> **核心原则**：`generate_spec_doc.py` 的所有文件输出（docx、png、drawio）
> 必须写入 `output/` 目录，绝不写入 `templates/` 或项目根目录。

---

## 模板来源说明

`templates/template_skeleton.docx` 由 `create_skeleton.py` 从原版参考文档提取：
- **原版参考文档**（外部，不入 git）：`烟台华新数智化改造项目一期_需求设计说明书_系统需求设计_生产管理分册.docx`
- 提取内容：封面1/封面2 + 修订记录 + 目录条目（168段落）
- 剔除内容：所有章节正文（H1-H5 及其正文内容）

若骨架模板不存在，`generate_spec_doc.py` 会自动 fallback 到外部原版文档。

---

## 流程图生成（draw_flow.py）

```python
from draw_flow import generate_flow_png, generate_flow_drawio, FLOW_PMPM_A01

# 生成 PNG（插入 Word 用）
generate_flow_png(FLOW_PMPM_A01, 'output/assets/PMPM-A-01.png')

# 生成 drawio XML（可在 draw.io 中编辑）
generate_flow_drawio(FLOW_PMPM_A01, 'output/assets/PMPM-A-01.drawio')
```

Flow 数据结构见 `draw_flow.py` 顶部注释。

---

## 扩展新文档

基于本流水线为新项目/新模块生成文档：

1. 复制 `scripts/generate_spec_doc.py`，修改 `META` 常量（客户名、项目名等）
2. 修改 `build_ch43()` 或新增 `build_chXX()` 函数填充章节内容
3. 运行后查看 `output/` 目录
4. **不要修改 `templates/` 里的任何文件**
