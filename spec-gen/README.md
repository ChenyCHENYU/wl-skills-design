# spec-gen — 通用绘图辅助工具

本目录独立于 npm 发布载荷，只保留不含项目数据的通用绘图脚本。

## 目录

```text
spec-gen/
├── README.md
├── scripts/
│   └── draw_flow.py      流程图 PNG / draw.io 生成器
└── output/               本地生成物，已 gitignore
```

旧版 Word 模板、深度解析报告和生成结果来自不可证明为纯合成的数据源，已按隐私基线移除，不得恢复到仓库。需要 Word 交付时，应从当前 Markdown 标准和匿名合成数据重新生成。

## 使用

```python
from draw_flow import generate_flow_png, generate_flow_drawio, img_placeholder_png

flow = {
    "id": "DEMO-A-01",
    "title": "示例审批流程",
    "lanes": ["申请人", "审核人", "系统"],
    "nodes": [
        ("E1", 2, "start", "开始", ""),
        ("N1", 0, "process", "提交申请", "DEMO-E-01"),
    ],
    "edges": [("E1", "N1", "")],
}

generate_flow_png(flow, "output/DEMO-A-01.png")
generate_flow_drawio(flow, "output/DEMO-A-01.drawio")
img_placeholder_png("示例列表页", "output/placeholder.png")
```

依赖：`Pillow`。所有输出只能写入 `output/`，不得写回脚本目录；提交前确认生成物未被 Git 跟踪且不含客户或生产数据。
