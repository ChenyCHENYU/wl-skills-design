# 设备点检 接口设计

### EQM-IF-01 点检单分页查询

#### (1) 触发条件（接口元信息）

| 项目 | 内容 |
|------|------|
| URL | `GET /api/v1/eqm/inspection-orders` |
| Method | GET |
| operationId | `queryInspectionPage` |
| 鉴权 | Token（JWT），Header `Authorization: Bearer <token>` |
| 幂等键 | 无（只读）|
| 超时（SLA）| 3s |

#### (2) 请求报文

| 序号 | 字段稳定 ID | 中文字段 | 英文字段 | 契约类型 | 必填/可空 | 描述与约束 |
|------|------------|---------|---------|---------|----------|-----------|
| 1 | EQM_F_DEVICE_CODE | 设备编码 | `deviceCode` | string | 可空 | 精确匹配过滤 |
| 2 | EQM_F_INSPECTION_STATUS | 点检状态 | `inspectionStatus` | string | 可空 | dict: inspection_status |
| 3 | EQM_F_INSPECTION_DATE | 点检日期 | `inspectionDate` | string(date) | 可空 | ISO 8601 full-date |
| 4 | EQM_F_PAGE_NUM | 页码 | `pageNum` | integer(int32) | 可空 | 默认 1 |
| 5 | EQM_F_PAGE_SIZE | 每页条数 | `pageSize` | integer(int32) | 可空 | 默认 10，上限 100 |

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
| operationId | `submitInspection` |
| 鉴权 | Token（JWT），Header `Authorization: Bearer <token>` |
| 幂等键 | `inspectionNo`（重复提交返回首次结果）|
| 超时（SLA）| 3s |

#### (2) 请求报文

| 序号 | 字段稳定 ID | 中文字段 | 英文字段 | 契约类型 | 必填/可空 | 描述与约束 |
|------|------------|---------|---------|---------|----------|-----------|
| 1 | EQM_F_INSPECTION_ID | 点检单ID | `id` | string | 必填 | 路径参数 |
| 2 | EQM_F_ITEMS | 点检项明细 | `items` | array&lt;object&gt; | 必填 | ≥1 条 |
| 2.1 | EQM_F_ITEM_NAME | 点检项目 | `items[].itemName` | string | 必填 | - |
| 2.2 | EQM_F_STD_VALUE | 标准值 | `items[].standardValue` | string | 可空 | 文本或区间 |
| 2.3 | EQM_F_ACT_VALUE | 实测值 | `items[].actualValue` | string | 必填 | - |

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
