# -*- coding: utf-8 -*-
"""
draw_flow.py  —  流程图双轨生成器
  1. generate_flow_png(flow, out_png)    → 用 Pillow 渲染泳道流程图 PNG，可直接插入 Word
  2. generate_flow_drawio(flow, out_drawio) → 生成 draw.io XML，供编辑/导出高清版
  3. img_placeholder_png(label, out_png)   → 生成灰底占位图（画面原型用）

Flow 数据结构
─────────────
flow = {
    'id'    : 'PMPM-A-01',
    'title' : '炼钢计划编制流程（PMPM-A-01）',
    'lanes' : ['计划员', '车间主任', '系统'],
    'nodes' : [
        # (node_id, lane_idx, type, main_label, sub_label)
        # type: 'start' | 'end' | 'process' | 'decision'
        ('E1', 2, 'start',    '开始',             ''),
        ('N1', 2, 'process',  '接收炼钢订单',      'PMPM-E-01 / 系统'),
        ...
    ],
    'edges' : [
        # (src_id, dst_id, label)
        ('E1', 'N1', ''),
        ('D1', 'N3', '否'),
        ...
    ]
}
"""

from PIL import Image, ImageDraw, ImageFont
import os, uuid, textwrap

# ─────────────────────────────── 字体 ───────────────────────────────
_FONT_PATH   = 'C:/Windows/Fonts/msyh.ttc'     # 微软雅黑
_FONT_PATH_B = 'C:/Windows/Fonts/msyhbd.ttc'   # 微软雅黑 Bold（不一定有）
if not os.path.exists(_FONT_PATH):
    _FONT_PATH = 'C:/Windows/Fonts/simsun.ttc'

def _font(size):
    try:
        return ImageFont.truetype(_FONT_PATH, size)
    except Exception:
        return ImageFont.load_default()

def _font_bold(size):
    path = _FONT_PATH_B if os.path.exists(_FONT_PATH_B) else _FONT_PATH
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# ─────────────────────────────── 颜色 ───────────────────────────────
LANE_BG = [
    (218, 232, 252),   # 蓝
    (255, 242, 204),   # 黄
    (213, 232, 212),   # 绿
    (255, 224, 224),   # 粉
    (235, 222, 240),   # 紫
]
LANE_HDR_BG = [
    (68,  114, 196),
    (192, 132,   0),
    (84,  130,  53),
    (196,  68,  68),
    (108,  84, 196),
]
WHITE      = (255, 255, 255)
BLACK      = (0,   0,   0)
GRAY_DARK  = (80,  80,  80)
GRAY_MED   = (160, 160, 160)
GRAY_LIGHT = (220, 220, 220)
BLUE_BOX   = (173, 216, 230)
GREEN_BOX  = (180, 230, 180)
PURPLE_BOX = (180, 140, 200)

# ─────────────────────────────── 布局常量 ───────────────────────────
TITLE_H = 46
HDR_H   = 40
ROW_H   = 78       # 每行高度
BOX_W   = 150      # process box 宽
BOX_H   = 42
DIA_W   = 100      # decision diamond 宽
DIA_H   = 44
OVAL_W  = 90
OVAL_H  = 30
SIDE_PAD = 28      # 画布左右留白
LOOP_MARGIN = 22   # 回环箭头离泳道边距


def _text_size(draw, text, font):
    """兼容 Pillow 9/10 两套 API"""
    try:
        bb = draw.textbbox((0, 0), text, font=font)
        return bb[2] - bb[0], bb[3] - bb[1]
    except AttributeError:
        return draw.textsize(text, font=font)


def _draw_arrow_line(draw, pts, color=GRAY_DARK, width=2):
    """折线 + 末端箭头"""
    for i in range(len(pts) - 1):
        draw.line([pts[i], pts[i+1]], fill=color, width=width)
    # 绘制箭头三角
    if len(pts) >= 2:
        x1, y1 = pts[-2]
        x2, y2 = pts[-1]
        dx, dy = x2 - x1, y2 - y1
        length = (dx**2 + dy**2) ** 0.5
        if length == 0:
            return
        ux, uy = dx / length, dy / length
        arrow_len = 10
        arrow_w   = 5
        px, py = -uy, ux
        tip = (x2, y2)
        base_l = (x2 - ux * arrow_len + px * arrow_w,
                  y2 - uy * arrow_len + py * arrow_w)
        base_r = (x2 - ux * arrow_len - px * arrow_w,
                  y2 - uy * arrow_len - py * arrow_w)
        draw.polygon([tip, base_l, base_r], fill=color)


def _draw_label(draw, txt, cx, cy, font, max_w=140, color=BLACK):
    """在(cx,cy)中心绘制可换行文字"""
    if not txt:
        return
    lines = []
    for raw in txt.split('\n'):
        lines += textwrap.wrap(raw, width=10) or ['']
    lh = _text_size(draw, '测', font)[1] + 2
    total_h = len(lines) * lh
    y0 = cy - total_h // 2
    for line in lines:
        tw, th = _text_size(draw, line, font)
        draw.text((cx - tw // 2, y0), line, font=font, fill=color)
        y0 += lh


def _draw_process(draw, cx, cy, label, sub='', bg=BLUE_BOX):
    r = 6
    x0, y0 = cx - BOX_W // 2, cy - BOX_H // 2
    x1, y1 = cx + BOX_W // 2, cy + BOX_H // 2
    draw.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=bg, outline=GRAY_DARK, width=1)
    font_main = _font(13)
    font_sub  = _font(10)
    if sub:
        _draw_label(draw, label, cx, cy - 7, font_main)
        tw, _ = _text_size(draw, sub, font_sub)
        draw.text((cx - tw // 2, cy + 10), sub, font=font_sub, fill=GRAY_DARK)
    else:
        _draw_label(draw, label, cx, cy, font_main)
    return (x0, y0, x1, y1)


def _draw_decision(draw, cx, cy, label):
    hw, hh = DIA_W // 2, DIA_H // 2
    pts = [(cx, cy - hh), (cx + hw, cy), (cx, cy + hh), (cx - hw, cy)]
    draw.polygon(pts, fill=GREEN_BOX, outline=GRAY_DARK)
    _draw_label(draw, label, cx, cy, _font(12))
    return (cx - hw, cy - hh, cx + hw, cy + hh)


def _draw_oval(draw, cx, cy, label, bg=PURPLE_BOX):
    hw, hh = OVAL_W // 2, OVAL_H // 2
    draw.ellipse([cx - hw, cy - hh, cx + hw, cy + hh], fill=bg, outline=GRAY_DARK)
    _draw_label(draw, label, cx, cy, _font_bold(13), color=WHITE)
    return (cx - hw, cy - hh, cx + hw, cy + hh)


# ───────────────────────── 主渲染函数 ────────────────────────────────

def generate_flow_png(flow: dict, out_png: str, px_width: int = 1260) -> str:
    """
    渲染泳道流程图 PNG。
    返回生成的文件路径。
    """
    lanes  = flow['lanes']
    nodes  = flow['nodes']   # [(id, lane_idx, type, label, sub), ...]
    edges  = flow.get('edges', [])
    title  = flow.get('title', flow.get('id', ''))

    n_lanes = len(lanes)
    lane_w  = (px_width - 2 * SIDE_PAD) // n_lanes
    n_rows  = len(nodes)
    height  = TITLE_H + HDR_H + n_rows * ROW_H + 40

    img  = Image.new('RGB', (px_width, height), WHITE)
    draw = ImageDraw.Draw(img)

    # ── 泳道背景 ──
    for li in range(n_lanes):
        x0 = SIDE_PAD + li * lane_w
        x1 = x0 + lane_w
        color = LANE_BG[li % len(LANE_BG)]
        draw.rectangle([x0, TITLE_H + HDR_H, x1, height - 10], fill=color, outline=GRAY_LIGHT)

    # ── 标题栏 ──
    draw.rectangle([0, 0, px_width, TITLE_H], fill=(44, 84, 148))
    font_title = _font_bold(17)
    tw, th = _text_size(draw, title, font_title)
    draw.text(((px_width - tw) // 2, (TITLE_H - th) // 2), title,
              font=font_title, fill=WHITE)

    # ── 泳道标题 ──
    for li, lname in enumerate(lanes):
        x0 = SIDE_PAD + li * lane_w
        hdr_color = LANE_HDR_BG[li % len(LANE_HDR_BG)]
        draw.rectangle([x0, TITLE_H, x0 + lane_w, TITLE_H + HDR_H],
                       fill=hdr_color)
        _draw_label(draw, lname, x0 + lane_w // 2, TITLE_H + HDR_H // 2,
                    _font_bold(14), color=WHITE)

    # ── 计算节点中心坐标 ──
    node_center = {}   # id → (cx, cy)
    node_bbox   = {}   # id → (x0,y0,x1,y1)
    node_map    = {n[0]: n for n in nodes}

    for row_idx, (nid, lane_idx, ntype, label, sub) in enumerate(nodes):
        cx = SIDE_PAD + lane_idx * lane_w + lane_w // 2
        cy = TITLE_H + HDR_H + row_idx * ROW_H + ROW_H // 2
        node_center[nid] = (cx, cy)

    # ── 先画边（在节点下面） ──
    edge_map_src = {}   # src_id → [(dst_id, label)]
    for (src, dst, lbl) in edges:
        edge_map_src.setdefault(src, []).append((dst, lbl))

    # 区分正向边（row递增）和回环边（row递减）
    node_row = {n[0]: i for i, n in enumerate(nodes)}

    for (src, dst, lbl) in edges:
        if src not in node_center or dst not in node_center:
            continue
        sx, sy = node_center[src]
        dx, dy = node_center[dst]
        src_row = node_row[src]
        dst_row = node_row[dst]

        if dst_row >= src_row:
            # 正向箭头
            pts = []
            if abs(sx - dx) < 5:
                # 同泳道：竖直
                pts = [(sx, sy + ROW_H // 2 - 8), (dx, dy - ROW_H // 2 + 8)]
            else:
                # 跨泳道：先下到中间行间隙，再横移，再下
                mid_y = (sy + dy) // 2
                pts = [(sx, sy + ROW_H // 2 - 8),
                       (sx, mid_y),
                       (dx, mid_y),
                       (dx, dy - ROW_H // 2 + 8)]
            _draw_arrow_line(draw, pts)
            # 画边标签
            if lbl:
                mx = (pts[0][0] + pts[-1][0]) // 2
                my = (pts[0][1] + pts[-1][1]) // 2
                tw, th = _text_size(draw, lbl, _font(11))
                draw.text((mx - tw // 2, my - th // 2), lbl,
                          font=_font(11), fill=(196, 68, 68))
        else:
            # 回环箭头：走右侧空白
            right_x = px_width - SIDE_PAD + LOOP_MARGIN
            # 出发点 → 右侧 → 目标行右侧 → 目标点
            pts = [(sx + BOX_W // 2, sy),
                   (right_x, sy),
                   (right_x, dy),
                   (dx + (DIA_W // 2 if node_map[dst][2] == 'decision' else BOX_W // 2), dy)]
            _draw_arrow_line(draw, pts, color=(196, 68, 68))
            if lbl:
                tw, _ = _text_size(draw, lbl, _font(11))
                draw.text((right_x + 4, (sy + dy) // 2), lbl,
                          font=_font(11), fill=(196, 68, 68))

    # ── 画节点 ──
    for nid, lane_idx, ntype, label, sub in nodes:
        cx, cy = node_center[nid]
        if ntype == 'start' or ntype == 'end':
            bb = _draw_oval(draw, cx, cy, label)
        elif ntype == 'decision':
            bb = _draw_decision(draw, cx, cy, label)
        else:
            bb = _draw_process(draw, cx, cy, label, sub)
        node_bbox[nid] = bb

    # ── 垂直泳道分割线 ──
    for li in range(1, n_lanes):
        x = SIDE_PAD + li * lane_w
        draw.line([(x, TITLE_H), (x, height - 10)], fill=GRAY_MED, width=1)

    # ── 保存 ──
    os.makedirs(os.path.dirname(out_png), exist_ok=True) if os.path.dirname(out_png) else None
    img.save(out_png, dpi=(150, 150))
    return out_png


# ─────────────────────── drawio XML 生成器 ──────────────────────────

def generate_flow_drawio(flow: dict, out_drawio: str) -> str:
    """
    生成 draw.io 泳道 XML 文件（可用 draw.io 桌面版直接打开、编辑、导出高清图）。
    布局约定：竖向泳道（每个泳道是一个竖列 swimlane）
    """
    lanes     = flow['lanes']
    nodes     = flow['nodes']
    edges     = flow.get('edges', [])
    title     = flow.get('title', flow.get('id', ''))
    diag_id   = flow.get('id', 'flow')

    n_lanes = len(lanes)
    LANE_W  = 220
    NODE_H  = 60
    NODE_W  = 160
    ROW_H_DX= 80
    START_Y = 60
    PAGE_W  = n_lanes * LANE_W + 80
    PAGE_H  = len(nodes) * ROW_H_DX + 200

    # lane色（填充/笔画）
    _LANE_FILL   = ['dae8fc','fff2cc','d5e8d4','ffe0e0','ebe6f0']
    _LANE_STROKE = ['6c8ebf','d6b656','82b366','cc4444','8080cc']
    _LANE_HDR_FILL=['dae8fc','fff2cc','d5e8d4','ffe0e0','ebe6f0']

    cells = []

    def new_id():
        return 'c' + uuid.uuid4().hex[:8]

    # 主容器（泳道父格）
    main_id = 'main'
    cells.append(
        f'<mxCell id="{main_id}" parent="1" '
        f'style="shape=table;startSize=40;container=1;collapsible=0;childLayout=tableLayout;'
        f'fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" '
        f'value="{_esc(title)}" vertex="1">'
        f'<mxGeometry x="40" y="20" width="{PAGE_W}" height="{PAGE_H}" as="geometry"/>'
        f'</mxCell>'
    )

    # 泳道列头
    for li, lname in enumerate(lanes):
        lf  = _LANE_FILL[li % len(_LANE_FILL)]
        lst = _LANE_STROKE[li % len(_LANE_STROKE)]
        hdr_id = f'lane_hdr_{li}'
        cells.append(
            f'<mxCell id="{hdr_id}" parent="{main_id}" '
            f'style="swimlane;startSize=30;fillColor=#{lf};strokeColor=#{lst};'
            f'fontStyle=1;fontSize=12;align=center;" '
            f'value="{_esc(lname)}" vertex="1">'
            f'<mxGeometry x="{li * LANE_W}" width="{LANE_W}" height="{PAGE_H}" as="geometry"/>'
            f'</mxCell>'
        )

    # 节点
    node_row = {n[0]: i for i, n in enumerate(nodes)}
    node_xml_id = {}   # node_id → mxCell id (for edge references)

    for row_idx, (nid, lane_idx, ntype, label, sub) in enumerate(nodes):
        cid = f'node_{nid}'
        node_xml_id[nid] = cid
        cx = lane_idx * LANE_W + (LANE_W - NODE_W) // 2
        cy = START_Y + row_idx * ROW_H_DX
        lname = lanes[lane_idx] if lane_idx < len(lanes) else ''
        parent = f'lane_hdr_{lane_idx}'

        disp_label = _esc(label + ('\n' + sub if sub else ''))

        if ntype in ('start', 'end'):
            style = ('shape=mxgraph.flowchart.terminator;whiteSpace=wrap;html=1;'
                     'fillColor=#76608a;strokeColor=#432D57;fontColor=#ffffff;fontSize=11;fontStyle=1;')
            w, h = 100, 30
        elif ntype == 'decision':
            style = ('rhombus;whiteSpace=wrap;html=1;'
                     'fillColor=#cdeb8b;strokeColor=#36393d;fontSize=11;align=center;verticalAlign=middle;')
            w, h = NODE_W, NODE_H
        else:  # process
            style = ('rounded=1;whiteSpace=wrap;html=1;arcSize=8;'
                     f'fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;align=center;')
            w, h = NODE_W, NODE_H

        cx_offset = cx + (LANE_W - w) // 2 - cx  # re-center
        cells.append(
            f'<mxCell id="{cid}" parent="{parent}" value="{disp_label}" '
            f'style="{style}" vertex="1">'
            f'<mxGeometry x="{cx}" y="{cy}" width="{w}" height="{h}" as="geometry"/>'
            f'</mxCell>'
        )

    # 边
    for eidx, (src, dst, lbl) in enumerate(edges):
        eid = f'edge_{eidx}'
        src_lane = nodes[node_row[src]][1] if src in node_row else 0
        dst_lane = nodes[node_row[dst]][1] if dst in node_row else 0
        src_xml  = node_xml_id.get(src, src)
        dst_xml  = node_xml_id.get(dst, dst)
        # 使用src所在泳道作为parent
        parent = f'lane_hdr_{src_lane}'
        style = 'edgeStyle=orthogonalEdgeStyle;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;'
        if node_row.get(dst, 99) < node_row.get(src, 0):
            style += 'entryX=1;entryY=0.5;curved=1;'
        cells.append(
            f'<mxCell id="{eid}" parent="1" source="{src_xml}" target="{dst_xml}" '
            f'value="{_esc(lbl)}" style="{style}" edge="1">'
            f'<mxGeometry relative="1" as="geometry"/>'
            f'</mxCell>'
        )

    cells_xml = '\n        '.join(cells)
    xml = f'''<mxfile host="Python-Generator" version="21.0.0">
  <diagram id="{diag_id}" name="{_esc(title)}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10"
                  guides="1" tooltips="1" connect="1" arrows="1" fold="1"
                  page="1" pageScale="1" pageWidth="{PAGE_W+200}" pageHeight="{PAGE_H+200}">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        {cells_xml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>'''

    with open(out_drawio, 'w', encoding='utf-8') as f:
        f.write(xml)
    return out_drawio


def _esc(s):
    return (str(s)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&apos;'))


# ─────────────────────── 占位图生成（画面原型用）────────────────────

def img_placeholder_png(label: str, out_png: str,
                         w: int = 900, h: int = 400) -> str:
    """生成灰底白字占位图，用于画面原型尚未设计时的占位"""
    img  = Image.new('RGB', (w, h), (220, 220, 220))
    draw = ImageDraw.Draw(img)
    draw.rectangle([2, 2, w - 3, h - 3], outline=(160, 160, 160), width=2)

    font_big  = _font_bold(22)
    font_small = _font(16)
    icon = '🖥'   # 有的系统不支持 emoji，退回纯文字
    lines = [
        '[ 画面原型 / 设计稿 ]',
        label,
        '──────────────────────────',
        '此处插入实际原型截图或 UI 设计稿',
    ]
    lh = 34
    total_h = len(lines) * lh
    y = (h - total_h) // 2
    for i, line in enumerate(lines):
        fn = font_big if i == 1 else font_small
        color = (80, 80, 80) if i != 1 else (44, 84, 148)
        tw, th = _text_size(draw, line, fn)
        draw.text(((w - tw) // 2, y), line, font=fn, fill=color)
        y += lh

    img.save(out_png, dpi=(150, 150))
    return out_png


# ─────────────────────── 流程数据定义 ────────────────────────────────

FLOW_PMPM_A01 = {
    'id'   : 'PMPM-A-01',
    'title': '炼钢计划编制流程（PMPM-A-01）',
    'lanes': ['计划员', '车间主任', '系统'],
    'nodes': [
        ('E1', 2, 'start',    '开始',              ''),
        ('N1', 2, 'process',  '接收炼钢订单',       'PMPM-E-01 / 系统'),
        ('N2', 0, 'process',  '编制炼钢计划',       'PMPM007 / 计划员'),
        ('D1', 0, 'decision', '数据完整？',          ''),
        ('N3', 0, 'process',  '修正并保存',          'PMPM007 / 计划员'),
        ('N4', 1, 'process',  '确认 / 审核计划',    'PMPM008 / 车间主任'),
        ('D2', 1, 'decision', '审核通过？',          ''),
        ('N5', 0, 'process',  '修改并重提',          'PMPM007 / 计划员'),
        ('N6', 1, 'process',  '下发计划至 MES',     'PMPM009 / 车间主任'),
        ('N7', 2, 'process',  '推送下发通知',        'API-PMPM-001 / 系统'),
        ('E2', 2, 'end',      '结束',               ''),
    ],
    'edges': [
        ('E1', 'N1', ''),
        ('N1', 'N2', ''),
        ('N2', 'D1', ''),
        ('D1', 'N3', '否'),
        ('N3', 'N2', ''),       # 回环
        ('D1', 'N4', '是'),
        ('N4', 'D2', ''),
        ('D2', 'N5', '否'),
        ('N5', 'N4', ''),       # 回环
        ('D2', 'N6', '是'),
        ('N6', 'N7', ''),
        ('N7', 'E2', ''),
    ],
}

FLOW_PMPM_A06 = {
    'id'   : 'PMPM-A-06',
    'title': '利库计划流程（PMPM-A-06）',
    'lanes': ['计划员', '库管员', '系统'],
    'nodes': [
        ('E1', 2, 'start',    '开始',              ''),
        ('N1', 2, 'process',  '识别可利库库存',     'PMPM-E-03 / 系统'),
        ('D1', 0, 'decision', '是否发起利库？',      ''),
        ('N2', 0, 'process',  '创建利库计划',       'PMPM030 / 计划员'),
        ('N3', 1, 'process',  '确认出库数量',        'PMPM030 / 库管员'),
        ('D2', 1, 'decision', '数量匹配？',          ''),
        ('N4', 0, 'process',  '调整计划数量',        'PMPM030 / 计划员'),
        ('N5', 2, 'process',  '生成利库单',          'PMPM030 / 系统'),
        ('E2', 2, 'end',      '结束',               ''),
    ],
    'edges': [
        ('E1', 'N1', ''),
        ('N1', 'D1', ''),
        ('D1', 'E2', '否'),
        ('D1', 'N2', '是'),
        ('N2', 'N3', ''),
        ('N3', 'D2', ''),
        ('D2', 'N4', '否'),
        ('N4', 'N3', ''),       # 回环
        ('D2', 'N5', '是'),
        ('N5', 'E2', ''),
    ],
}


if __name__ == '__main__':
    # 独立测试
    import sys
    out_dir = os.path.dirname(os.path.abspath(__file__))

    png1 = generate_flow_png(FLOW_PMPM_A01,
                              os.path.join(out_dir, '_test_A01.png'))
    print('PNG  生成：', png1)

    dx1 = generate_flow_drawio(FLOW_PMPM_A01,
                                os.path.join(out_dir, '_test_A01.drawio'))
    print('drawio 生成：', dx1)

    ph = img_placeholder_png('PMPM007 炼钢计划编制',
                              os.path.join(out_dir, '_test_placeholder.png'))
    print('占位图生成：', ph)
