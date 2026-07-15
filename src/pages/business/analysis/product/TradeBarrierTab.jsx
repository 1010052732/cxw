import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Alert,
  Button,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
  Form,
  InputNumber,
  List,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Column } from '@ant-design/charts'
import {
  CloudDownloadOutlined,
  FileTextOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  BARRIER_COUNTRY_OPTIONS,
  BARRIER_TYPE_OPTIONS,
  MARKET_COUNTRIES,
  getProductDetail,
  getTradeBarrierData,
} from '../../../../mock/analysis'
import { downloadTextFile, exportCsv, exportJsonAsTxt } from '../analysisExport'
import {
  TB_WORKFLOW_STEPS,
  TRADE_TERM_OPTIONS,
  buildCompliancePlan,
  buildDocumentChecklist,
  compareRoutes,
  exportBarrierReportTxt,
} from './tradeBarrierEngine'
import {
  appendCertApplication,
  loadCertApplications,
  loadDocumentChecks,
  saveDocumentCheck,
} from './tradeBarrierStore'
import ProductSwitcher from './ProductSwitcher'

const { Text, Paragraph, Title } = Typography

const BARRIER_TYPE_COLOR = {
  关税: 'error', TBT: 'warning', SPS: 'orange', 反倾销: 'red', 反补贴: 'red',
  出口管制: 'purple', 配额: 'default', 禁令: 'error', 许可证: 'processing',
  知识产权: 'blue', 绿色壁垒: 'green', 保障措施: 'volcano',
}

const DIFFICULTY_COLOR = { 高: 'error', 中: 'warning', 低: 'success' }

export default function TradeBarrierTab({ productName, skuLabel, filters = {}, onGoQuery }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [workflowStep, setWorkflowStep] = useState(0)
  const [country, setCountry] = useState('all')
  const [barrierType, setBarrierType] = useState('all')
  const [cargoValue, setCargoValue] = useState(100)
  const [quantity, setQuantity] = useState(1000)
  const [origin, setOrigin] = useState(filters.origin === 'all' ? '中国' : filters.origin)
  const [targetMarket, setTargetMarket] = useState(
    filters.targetMarket === 'all' ? '德国' : filters.targetMarket,
  )
  const [tradeTerm, setTradeTerm] = useState('CIF')
  const [tradeMode] = useState(filters.tradeMode || 'general')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [detailBarrier, setDetailBarrier] = useState(null)
  const [docChecks, setDocChecks] = useState({})
  const [certApps, setCertApps] = useState(() => loadCertApplications(productName))

  const product = useMemo(() => getProductDetail(productName), [productName])
  const hsCode = product.codes?.hs || product.hsCode || '8708'

  const data = useMemo(
    () => getTradeBarrierData(productName, country === 'all' ? 'all' : country, { barrierType }),
    [productName, country, barrierType],
  )

  const costInputs = useMemo(() => ({
    cargoValue, quantity, origin, targetMarket, tradeTerm, hsCode,
  }), [cargoValue, quantity, origin, targetMarket, tradeTerm, hsCode])

  const routeCompare = useMemo(
    () => compareRoutes(data.routes, costInputs, data.barriers),
    [data.routes, costInputs, data.barriers],
  )

  const activeRoute = selectedRoute || routeCompare.find((r) => r.recommended) || routeCompare[0]
  const costDetail = activeRoute || null

  const compareChart = routeCompare.map((r) => ({ name: r.name, value: r.totalCost || r.total }))
  const marketCountryValue = MARKET_COUNTRIES.find((c) => c.label === targetMarket)?.value || 'germany'

  const compliancePlan = useMemo(
    () => buildCompliancePlan(data.certifications, targetMarket),
    [data.certifications, targetMarket],
  )

  const documentList = useMemo(() => {
    const list = buildDocumentChecklist(data.documents, { productName, targetMarket, tradeMode, hsCode })
    return list.map((d) => ({ ...d, checked: docChecks[d.id] || false }))
  }, [data.documents, productName, targetMarket, tradeMode, hsCode, docChecks])

  useEffect(() => {
    setDocChecks(loadDocumentChecks(productName, targetMarket))
    setCertApps(loadCertApplications(productName))
    setWorkflowStep(0)
    setSelectedRoute(null)
  }, [productName, targetMarket])

  const handleExportBarriers = () => {
    exportCsv(
      `trade-barriers-${productName}.csv`,
      ['country', 'type', 'desc', 'law', 'status', 'rate', 'exemption', 'originRule', 'complianceDifficulty', 'impactScope'],
      data.barriers,
    )
    message.success('壁垒清单已导出')
  }

  const handleExportReport = () => {
    exportJsonAsTxt(
      `贸易壁垒报告-${productName}.txt`,
      exportBarrierReportTxt(data, costInputs, activeRoute),
    )
    message.success('贸易壁垒分析报告已导出')
  }

  const handleCertApply = (cert) => {
    const entry = appendCertApplication(productName, cert)
    setCertApps((prev) => [entry, ...prev])
    message.success(`已提交 ${cert.cert} 认证对接申请`)
  }

  const handleDocCheck = (docId, checked) => {
    const next = saveDocumentCheck(productName, targetMarket, docId, checked)
    setDocChecks(next)
  }

  const handleDownloadTemplate = (row) => {
    const langs = (row.lang || 'EN').split('/')
    const template = [
      `清关文件准备清单 · ${row.doc}`,
      `商品：${productName} · HS ${hsCode}`,
      `目标市场：${targetMarket} · 贸易方式：${tradeMode}`,
      `语言版本：${row.lang}`,
      '',
      ...langs.map((lang) => `[${lang.trim()} 版本]`),
      '□ 文件名称已核对',
      '□ 语言版本符合要求',
      `□ ${row.required ? '必需文件已备齐' : '可选文件已评估'}`,
      '□ 签章/认证已完成',
      '□ 副本份数符合海关要求',
      '',
      '备注：',
    ].join('\n')
    downloadTextFile(row.templateName || `${row.doc}-template.txt`, template)
    message.success('多语种模板已下载')
  }

  const docProgress = documentList.filter((d) => d.required)
  const docReady = docProgress.filter((d) => d.checked).length
  const docTotal = docProgress.length

  return (
    <>
      <div className="price-workflow-bar">
        <SafetyCertificateOutlined style={{ color: '#B32620' }} />
        <Text type="secondary">分析流程：</Text>
        <Steps
          size="small"
          current={workflowStep}
          onChange={setWorkflowStep}
          items={TB_WORKFLOW_STEPS}
          style={{ flex: 1, maxWidth: 520 }}
        />
        <Button
          type="link"
          size="small"
          icon={<GlobalOutlined />}
          onClick={() => navigate(`/analysis/market?tab=policy&country=${marketCountryValue}&hs=${hsCode}`)}
        >
          关联政策解读
        </Button>
      </div>

      <div className="business-filter-bar">
        <Space wrap>
          <ProductSwitcher productName={productName} skuLabel={skuLabel} onGoQuery={onGoQuery} />
          <Text>HS {hsCode}</Text>
          <Select value={country} style={{ width: 120 }} options={BARRIER_COUNTRY_OPTIONS} onChange={setCountry} />
          <Select
            value={barrierType}
            style={{ width: 140 }}
            options={[{ value: 'all', label: '全部壁垒类型' }, ...(BARRIER_TYPE_OPTIONS || [])]}
            onChange={setBarrierType}
          />
        </Space>
        <Space>
          <Button icon={<FileTextOutlined />} onClick={handleExportReport}>导出报告</Button>
          <Button icon={<CloudDownloadOutlined />} onClick={handleExportBarriers}>导出壁垒</Button>
        </Space>
      </div>

      {workflowStep === 0 && (
        <div className="business-panel">
          <h3 className="business-panel-title">结构化壁垒数据库 · 国家-商品-壁垒类型</h3>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message={`数据同步 · ${data.syncMeta?.lastSync}`}
            description={`来源：${(data.syncMeta?.sources || []).join('、')} · ${data.syncMeta?.coverage}`}
          />
          <Table
            rowKey={(r) => `${r.country}-${r.type}-${r.desc}`}
            size="small"
            pagination={{ pageSize: 8 }}
            dataSource={data.barriers}
            onRow={(record) => ({ onClick: () => setDetailBarrier(record), style: { cursor: 'pointer' } })}
            columns={[
              { title: '国家', dataIndex: 'country', width: 72 },
              { title: '类型', dataIndex: 'type', width: 80, render: (v) => <Tag color={BARRIER_TYPE_COLOR[v] || 'default'}>{v}</Tag> },
              { title: '描述', dataIndex: 'desc', ellipsis: true },
              { title: '法律依据', dataIndex: 'law', width: 100, ellipsis: true },
              { title: '状态', dataIndex: 'status', width: 72, render: (v) => <Tag>{v}</Tag> },
              { title: '税率/限制', dataIndex: 'rate', width: 88 },
              { title: '合规难度', dataIndex: 'complianceDifficulty', width: 80, render: (v) => <Tag color={DIFFICULTY_COLOR[v]}>{v}</Tag> },
              { title: '影响范围', dataIndex: 'impactScope', width: 88, ellipsis: true },
            ]}
          />
          <Button type="primary" size="small" style={{ marginTop: 12 }} onClick={() => setWorkflowStep(1)}>
            进入成本模拟 →
          </Button>
        </div>
      )}

      {workflowStep === 1 && (
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <div className="business-panel">
              <h3 className="business-panel-title">综合成本计算器 · 多方案对比</h3>
              <Form layout="inline" style={{ marginBottom: 16 }} wrap>
                <Form.Item label="货值(万)">
                  <InputNumber min={1} value={cargoValue} onChange={(v) => setCargoValue(v || 0)} addonAfter="万" />
                </Form.Item>
                <Form.Item label="数量">
                  <InputNumber min={1} value={quantity} onChange={(v) => setQuantity(v || 0)} />
                </Form.Item>
                <Form.Item label="原产地">
                  <Select value={origin} style={{ width: 100 }} options={[{ value: '中国', label: '中国' }, { value: '越南', label: '越南' }, { value: '东盟', label: '东盟' }]} onChange={setOrigin} />
                </Form.Item>
                <Form.Item label="目标市场">
                  <Select
                    value={targetMarket}
                    style={{ width: 100 }}
                    options={MARKET_COUNTRIES.map((c) => ({ value: c.label, label: c.label }))}
                    onChange={(v) => { setTargetMarket(v); setSelectedRoute(null) }}
                  />
                </Form.Item>
                <Form.Item label="贸易条款">
                  <Select value={tradeTerm} style={{ width: 110 }} options={TRADE_TERM_OPTIONS} onChange={setTradeTerm} />
                </Form.Item>
              </Form>
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={routeCompare}
                rowSelection={{
                  type: 'radio',
                  selectedRowKeys: activeRoute ? [activeRoute.id] : [],
                  onChange: (_, rows) => setSelectedRoute(rows[0]),
                }}
                columns={[
                  {
                    title: '贸易路径',
                    dataIndex: 'name',
                    render: (v, r) => (
                      <Space>
                        {v}
                        {r.recommended && <Tag color="success">推荐</Tag>}
                        {r.ftaApplied && <Tag color="blue">FTA</Tag>}
                      </Space>
                    ),
                  },
                  { title: '关税%', dataIndex: 'tariff', width: 64 },
                  { title: '增值税%', dataIndex: 'vat', width: 64 },
                  { title: '综合费率%', dataIndex: 'rateTotal', width: 80 },
                  { title: '到岸成本(万)', dataIndex: 'totalCost', width: 96, render: (v, r) => <Text strong style={{ color: '#B32620' }}>{v ?? r.total}</Text> },
                ]}
              />
              <div className="business-chart-box-sm" style={{ marginTop: 16 }}>
                <Column data={compareChart} xField="name" yField="value" height={200} color="#B32620" label={{ position: 'top' }} />
              </div>
              <Button size="small" style={{ marginTop: 12 }} onClick={() => setWorkflowStep(2)}>进入合规路径 →</Button>
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <div className="business-panel">
              <h3 className="business-panel-title">成本明细 · {activeRoute?.name}</h3>
              {costDetail && (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="货值">{costDetail.cargoValue} 万元</Descriptions.Item>
                  <Descriptions.Item label="数量">{costDetail.quantity}</Descriptions.Item>
                  <Descriptions.Item label="贸易条款">{costDetail.tradeTerm}</Descriptions.Item>
                  <Descriptions.Item label="关税">{costDetail.tariffCost} 万元</Descriptions.Item>
                  <Descriptions.Item label="增值税/消费税">{costDetail.vatCost} 万元</Descriptions.Item>
                  <Descriptions.Item label="反倾销/反补贴">{costDetail.addDuty} 万元</Descriptions.Item>
                  {costDetail.quotaFee > 0 && <Descriptions.Item label="配额费">{costDetail.quotaFee} 万元</Descriptions.Item>}
                  <Descriptions.Item label="检验检测">{costDetail.inspectionCost} 万元</Descriptions.Item>
                  <Descriptions.Item label="代理/通关">{costDetail.agency} 万元</Descriptions.Item>
                  <Descriptions.Item label="到岸总成本">
                    <Text strong style={{ color: '#B32620', fontSize: 18 }}>{costDetail.total} 万元</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="测算说明">{costDetail.note}</Descriptions.Item>
                </Descriptions>
              )}
              <Paragraph type="secondary" style={{ marginTop: 12 }}>
                支持直出口/转口、FTA原产地证书/标准路径等多方案对比；切换参数后自动重算。
              </Paragraph>
            </div>
          </Col>
        </Row>
      )}

      {workflowStep === 2 && (
        <div className="business-panel">
          <h3 className="business-panel-title"><SafetyCertificateOutlined /> 认证要求清单与合规指引</h3>
          <Table rowKey="cert" size="small" pagination={false} dataSource={data.certifications} columns={[
            { title: '市场', dataIndex: 'market', width: 70 },
            { title: '认证', dataIndex: 'cert' },
            { title: '强制性', dataIndex: 'mandatory', width: 70, render: (v) => <Tag color={v ? 'error' : 'default'}>{v ? '强制' : '自愿'}</Tag> },
            { title: '周期', dataIndex: 'cycle', width: 90 },
            { title: '机构', dataIndex: 'agency', ellipsis: true },
            {
              title: '操作',
              width: 100,
              render: (_, row) => (
                <Button type="link" size="small" onClick={() => handleCertApply(row)}>对接机构</Button>
              ),
            },
          ]} />
          <Title level={5} style={{ marginTop: 16 }}>分步合规指引 · {targetMarket}</Title>
          <List
            dataSource={compliancePlan}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<Space><Tag>步骤{item.step}</Tag>{item.cert}</Space>}
                  description={
                    <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 12 }}>
                      {item.actions.map((a) => <li key={a}>{a}</li>)}
                    </ul>
                  }
                />
              </List.Item>
            )}
          />
          {certApps.length > 0 && (
            <Alert
              type="success"
              showIcon
              style={{ marginTop: 12 }}
              message={`已提交 ${certApps.length} 项认证对接`}
              description={certApps[0] ? `${certApps[0].cert} · ${certApps[0].agency} · ${certApps[0].time}` : ''}
            />
          )}
          <Button type="primary" size="small" style={{ marginTop: 12 }} onClick={() => setWorkflowStep(3)}>
            进入文件清单 →
          </Button>
        </div>
      )}

      {workflowStep === 3 && (
        <div className="business-panel">
          <h3 className="business-panel-title"><FileTextOutlined /> 清关文件准备清单</h3>
          <Alert
            type={docReady === docTotal ? 'success' : 'warning'}
            showIcon
            style={{ marginBottom: 12 }}
            message={`必需文件进度 ${docReady}/${docTotal}`}
            description="根据商品类型、目标国及贸易方式自动生成；支持多语种模板下载。"
          />
          <Table rowKey="id" size="small" pagination={false} dataSource={documentList} columns={[
            {
              title: '备齐',
              width: 50,
              render: (_, row) => (
                <Checkbox checked={row.checked} onChange={(e) => handleDocCheck(row.id, e.target.checked)} />
              ),
            },
            { title: '文件', dataIndex: 'doc' },
            { title: '必需', dataIndex: 'required', width: 60, render: (v) => v ? <Tag color="error">是</Tag> : <Tag>否</Tag> },
            { title: '语言', dataIndex: 'lang', width: 100 },
            { title: '说明', dataIndex: 'hint', ellipsis: true },
            {
              title: '模板',
              width: 80,
              render: (_, row) => (
                <Button type="link" size="small" onClick={() => handleDownloadTemplate(row)}>下载</Button>
              ),
            },
          ]} />
          <div className="business-filter-bar" style={{ justifyContent: 'center', marginTop: 16 }}>
            <Button
              type="primary"
              disabled={docReady < docTotal}
              onClick={() => {
                message.success('清关文件已备齐，可进入企业分析评估贸易伙伴')
                navigate(`/analysis/enterprise?tab=partner&q=${encodeURIComponent('华贸进出口集团')}`)
              }}
            >
              文件备齐 · 进入企业分析 →
            </Button>
          </div>
        </div>
      )}

      <Drawer
        title={`壁垒详情 · ${detailBarrier?.country} · ${detailBarrier?.type}`}
        open={!!detailBarrier}
        onClose={() => setDetailBarrier(null)}
        width={480}
      >
        {detailBarrier && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="描述">{detailBarrier.desc}</Descriptions.Item>
            <Descriptions.Item label="法律依据">{detailBarrier.law}</Descriptions.Item>
            <Descriptions.Item label="生效状态">{detailBarrier.status}</Descriptions.Item>
            <Descriptions.Item label="税率/限制">{detailBarrier.rate}</Descriptions.Item>
            <Descriptions.Item label="豁免条件">{detailBarrier.exemption}</Descriptions.Item>
            <Descriptions.Item label="原产地规则">{detailBarrier.originRule}</Descriptions.Item>
            <Descriptions.Item label="合规难度">
              <Tag color={DIFFICULTY_COLOR[detailBarrier.complianceDifficulty]}>{detailBarrier.complianceDifficulty}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="实施时间">{detailBarrier.effectivePeriod}</Descriptions.Item>
            <Descriptions.Item label="影响范围">{detailBarrier.impactScope}</Descriptions.Item>
            <Descriptions.Item label="更新日期">{detailBarrier.updatedAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </>
  )
}
