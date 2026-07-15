# 设备点检 接口设计

### EQM-IF-01 点检单分页查询

#### (1) 触发条件（接口元信息）

| 项目 | 内容 |
|------|------|
| URL | `GET /api/v1/eqm/inspection-orders` |
| Method | GET |
| 鉴权 | Token（JWT），Header `Authorization: Bearer <token>` |
| 幂等键 | 无（只读）|
| 超时（SLA）| 3s |

#### (2) 请求报文

| 序号 | 中文字段 | 英文字段 | 类型 | 描述 | 备注 |
|------|---------|---------|------|------|------|
| 1 | 设备编码 | `deviceCode` | String | 设备编码过滤 | 选填 |
| 2 | 点检状态 | `inspectionStatus` | String | dict: inspection_status | 选填 |
| 3 | 点检日期 | `inspectionDate` | String | yyyy-MM-dd | 选填 |
| 4 | 页码 | `pageNum` | Integer | 默认 1 | 选填 |
| 5 | 每页条数 | `pageSize` | Integer | 默认 10 | 选填 |

#### (3) 应答报文（统一包装）

```json
{
  "code": "0",
  "msg": "success",
  "traceId": "a1b2c3d4",
  "data": {
    "total": 1,
    "rows": [
      {
        "id": "1001",
        "inspectionNo": "INS20260601001",
        "deviceCode": "DEV-001",
        "deviceName": "1号设备B",
        "inspectionDate": "2026-06-01",
        "inspector": "张工",
        "inspectionStatus": "SUBMITTED",
        "result": "NORMAL"
      }
    ]
  }
}
```

#### (4) 状态码与错误码

| HTTP 状态码 | 业务错误码 | 含义 | 处理建议 |
|------------|-----------|------|---------|
| 200 | 0 | 成功 | - |
| 500 | `EQM-S-001` | 服务端异常 | 重试或联系运维 |

---

### EQM-IF-02 提交点检单

#### (1) 触发条件（接口元信息）

| 项目 | 内容 |
|------|------|
| URL | `POST /api/v1/eqm/inspection-orders/{id}/submit` |
| Method | POST |
| 鉴权 | Token（JWT），Header `Authorization: Bearer <token>` |
| 幂等键 | `inspectionNo`（重复提交返回首次结果）|
| 超时（SLA）| 3s |

#### (2) 请求报文

| 序号 | 中文字段 | 英文字段 | 类型 | 描述 | 备注 |
|------|---------|---------|------|------|------|
| 1 | 点检单ID | `id` | String | 路径参数 | 必填 |
| 2 | 点检项明细 | `items` | Array | 提交前最终明细 | 必填，≥1 条 |
| 2.1 | 点检项目 | `items[].itemName` | String | - | 必填 |
| 2.2 | 标准值 | `items[].standardValue` | String | - | 选填 |
| 2.3 | 实测值 | `items[].actualValue` | String | - | 必填 |

#### (3) 应答报文（统一包装）

```json
{
  "code": "0",
  "msg": "success",
  "traceId": "e5f6g7h8",
  "data": {
    "id": "1001",
    "inspectionStatus": "SUBMITTED",
    "result": "ABNORMAL"
  }
}
```

#### (4) 状态码与错误码

| HTTP 状态码 | 业务错误码 | 含义 | 处理建议 |
|------------|-----------|------|---------|
| 200 | 0 | 成功 | - |
| 404 | `EQM-V-001` | 点检单不存在 | 检查 id |
| 409 | `EQM-B-001` | 状态不允许提交 | 刷新后重试 |
| 400 | `EQM-B-002` | 点检项为空 | 至少录入一条点检项 |
| 500 | `EQM-S-001` | 服务端异常 | 重试或联系运维 |
