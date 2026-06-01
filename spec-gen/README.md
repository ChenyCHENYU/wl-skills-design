# spec-gen — 设计文档生成工具集

本目录包含设计文档生成的辅助工具，独立于 npm 包主体，**不会发布到 npm**。

---

## 目录结构

```
spec-gen/
├── README.md               本文档
│
├── scripts/                工具脚本（受 git 追踪）
│   └── draw_flow.py        流程图双轨生成器（PNG + drawio XML）
│
├── templates/              ⚠️ 只读模板区（受 git 追踪，禁止脚本写入）
│   └── template_skeleton.docx   Word 格式骨架（封面 + 目录结构 + 所有样式）
│
├── output/                 生成物（.gitignored，不入 git）
│   └── assets/             中间图片资源
│
└── analysis/               分析报告（受 git 追踪，作为参考资料）
    └── doc_deep_analysis.txt    原版文档深度解析结果（华新项目参考）
```

---

## 工具说明

### draw_flow.py — 流程图双轨生成器

通用的流程图生成工具，支持两种输出格式：

```python
from draw_flow import generate_flow_png, generate_flow_drawio, img_placeholder_png

# 定义流程数据
flow = {
    'id'    : 'PMPM-A-01',
    'title' : '炼钢计划编制流程',
    'lanes' : ['计划员', '车间主任', '系统'],
    'nodes' : [
        # (node_id, lane_idx, type, main_label, sub_label)
        ('E1', 2, 'start', '开始', ''),
        ('N1', 2, 'process', '接收炼钢订单', 'PMPM-E-01'),
        ...
    ],
    'edges' : [
        ('E1', 'N1', ''),
        ...
    ]
}

# 生成 PNG（插入 Word 用）
generate_flow_png(flow, 'output/assets/PMPM-A-01.png')

# 生成 drawio XML（可在 draw.io 中编辑）
generate_flow_drawio(flow, 'output/assets/PMPM-A-01.drawio')

# 生成占位图（原型 UI 占位用）
img_placeholder_png('客户档案列表页', 'output/assets/placeholder.png')
```

**依赖**：`pip install Pillow`

**适用场景**：
- 从 spec 流程说明批量生成流程图 PNG
- 生成 drawio 文件供人工编辑微调
- 为原型设计生成 UI 占位图

---

## 模板保护规则

| 目录 | 属性 | 说明 |
|------|------|------|
| `templates/` | **只读**（受 git 追踪） | 格式基准，任何脚本**不得**覆盖 |
| `output/` | 可写（.gitignored） | 所有生成物写入此处 |
| `scripts/` | 可写（受 git 追踪） | 工具脚本 |
| `analysis/` | 只读（受 git 追踪） | 参考资料 |

---

## 已废弃脚本（已删除）

| 脚本 | 原用途 | 废弃原因 |
|------|--------|---------|
| `generate_spec_doc.py` | 华新计划模块 Word 文档生成 | 项目特定硬编码内容，不可复用 |
| `create_skeleton.py` | 从原版文档提取骨架模板 | 一次性工具，已完成使命 |

> 这些脚本的职责已被 `wl-skills-design` 的 Skill 体系取代：  
> AI 通过 `create-spec-section` prompt 直接生成 Markdown 格式的设计文档，  
> 再由团队按需转换为 Word（未来可通过 md2docx 工具自动化）。
